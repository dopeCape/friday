import { Chapter, GeneratedModuleData, Logger, Module, ModuleGenerationData, ModuleRepository as ModuleRepositoryType } from "@/types"
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import mongoose from "mongoose";
import {
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import LLMService from "./llm.service";
import { PromptProvider } from "../providers/prompt.provider";
import { moduleContentSchema } from "../schemas";
import IconsProvider from "../providers/icons.provider";
import SearchService from "./serarch.service";
import QuizService from "./quiz.service";
import ChapterService from "./chapter.service";

export default class ModuleService {
  private logger: Logger;
  private static instance: ModuleService;
  private moduleRepository: ModuleRepositoryType;
  private quizService: QuizService;
  private chapterService: ChapterService;
  private errorHandler: CentralErrorHandler;
  private llmService: LLMService;
  private iconProvider: IconsProvider;
  private searchService: SearchService

  private constructor(logger: Logger, moduleRepository: ModuleRepositoryType,
    llmService: LLMService, iconProvider: IconsProvider, searchService: SearchService, quizService: QuizService, chapterService: ChapterService
  ) {
    this.logger = logger;
    this.moduleRepository = moduleRepository;
    this.errorHandler = new CentralErrorHandler(logger);
    this.iconProvider = iconProvider
    this.llmService = llmService
    this.searchService = searchService
    this.quizService = quizService;
    this.chapterService = chapterService;
  }

  public static getInstance(logger: Logger, moduleRepository: ModuleRepositoryType, llmService: LLMService, iconProvider: IconsProvider, searchService: SearchService, quizService: QuizService, chapterService: ChapterService) {
    if (!this.instance) {
      const moduleService = new ModuleService(logger, moduleRepository, llmService, iconProvider, searchService, quizService, chapterService);
      this.instance = moduleService;
    }
    return this.instance
  }

  private getModuleGenerationPrompt(modules: (ModuleGenerationData | null)[]) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Creating prompt for module generation", { modules })
      const systemMessage = new SystemMessage(PromptProvider.getModuleContentGenerationPrompt())
      const humanMessage = new HumanMessage(`
Current module:
 - title: ${modules[0]?.title}
 - description: ${modules[0]?.description}
 - topicsToCover:${modules[0]?.topicsToCover}

Previous module
 - title: ${modules[1]?.title}
 - description: ${modules[1]?.description}
 - topicsToCover:${modules[1]?.topicsToCover}

Next module
 - title: ${modules[2]?.title}
 - description: ${modules[2]?.description}
 - topicsToCover:${modules[2]?.topicsToCover}
`)
      this.logger.info("Module generation prompt", {
        systemMessage,
        humanMessage
      })
      return [systemMessage, humanMessage]
    }, {
      service: "ModuleService",
      method: "getModuleGenerationPrompt"
    })
  }

  private async generateModuleContent(modules: ModuleGenerationData[]) {
    this.logger.info("Generating module content", { modules });
    const startIndex = 0;
    const lastIndex = modules.length - 1;

    const generationResults = await Promise.all(modules.map(async (module, index) => {
      const moduleGenerationContext = [];
      moduleGenerationContext.push(module)

      if (index === startIndex) {
        moduleGenerationContext.push(null)
        moduleGenerationContext.push(modules[index + 1])
      } else if (index === lastIndex) {
        moduleGenerationContext.push(modules[index - 1])
        moduleGenerationContext.push(null)
      } else {
        moduleGenerationContext.push(modules[index - 1])
        moduleGenerationContext.push(modules[index + 1])
      }

      const generatedModule = await this.llmService.structuredRespose(
        await this.getModuleGenerationPrompt(moduleGenerationContext),
        moduleContentSchema,
        {
          provider: "openai",
          model: "gpt-4o-mini",
        }
      );

      return generatedModule;
    }));

    return generationResults;
  }

  public async createModules(modules: ModuleGenerationData[], courseId: string, isTemplate: boolean = false) {
    return this.errorHandler.handleError(async () => {
      // First generate all module content
      const generatedModules = await this.generateModuleContent(modules);

      // Get icons for all modules at once
      const iconQueries = generatedModules.map(module => module.iconQuery);
      const icons = await this.iconProvider.searchIconsBatch(iconQueries);

      const createdModules: Module[] = [];
      const createdChapters: Chapter[] = [];

      // Create modules and chapters with proper IDs and relationships
      for (let i = 0; i < generatedModules.length; i++) {
        const generatedModule = generatedModules[i];
        const moduleId = new mongoose.Types.ObjectId().toString();

        // Create chapters for this module
        const chapters: Chapter[] = generatedModule.chapters.map(chapter => ({
          _id: new mongoose.Types.ObjectId().toString(),
          title: chapter.title,
          content: [],
          isGenerated: false,
          refs: [],
          moduleId,
          type: "chapter",
          isCompleted: false,
          isUserSpecific: !isTemplate,
        }));

        // Create the module
        const module: Module = {
          title: generatedModule.title,
          _id: moduleId,
          description: generatedModule.description,
          courseId: courseId,
          refs: [],  // We'll populate refs after saving
          contents: chapters.map(ch => ch._id),
          isLocked: i !== 0,  // First module is unlocked
          isCompleted: false,
          currentChapterId: chapters[0]._id,
          icon: icons[i],
          difficultyLevel: generatedModule.difficultyLevel,
          prerequisites: generatedModule.prerequisites,
          estimatedCompletionTime: generatedModule.estimatedCompletionTime,
          learningObjectives: generatedModule.learningObjectives,
          moduleType: "content",
        };

        createdModules.push(module);
        createdChapters.push(...chapters);
      }

      // Save everything
      await this.moduleRepository.createMany(createdModules);
      await this.chapterService.createChapters(createdChapters);

      // Update refs after saving (this can be done asynchronously)
      this.updateModuleRefs(createdModules, generatedModules);

      return { modules: createdModules, chapters: createdChapters };
    }, {
      service: "ModuleService",
      method: "createModules"
    });
  }

  private async updateModuleRefs(modules: Module[], generatedModules: GeneratedModuleData[]) {
    await Promise.all(modules.map(async (module, index) => {
      const refs: string[] = [];
      await Promise.all(generatedModules[index].refs.map(async (ref) => {
        const searchResults = await this.searchService.search(ref)
        if (searchResults.results) {
          refs.push(searchResults.results[0].url)
        }
      }));

      if (refs.length > 0) {
        await this.moduleRepository.update(
          { _id: module._id },
          { $set: { refs } }
        );
      }
    }));
  }

  public async cloneModulesForCourse(templateCourseId: string, newCourseId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Cloning modules for course", { templateCourseId, newCourseId });
      
      const templateModules = await this.moduleRepository.list({ courseId: templateCourseId });
      
      const newModules: Module[] = [];
      const newChapters: Chapter[] = [];
      
      for (const templateModule of templateModules) {
        const newModuleId = new mongoose.Types.ObjectId().toString();
        
        const templateChapters = await this.chapterService.getChaptersByModuleId(templateModule._id);
        
        const moduleChapters = templateChapters.map(chapter => {
          const newChapterId = new mongoose.Types.ObjectId().toString();
          return {
            ...chapter,
            _id: newChapterId,
            moduleId: newModuleId,
            isUserSpecific: true,
          };
        });
        
        const newModule: Module = {
          ...templateModule,
          _id: newModuleId,
          courseId: newCourseId,
          contents: moduleChapters.map(chapter => chapter._id),
          currentChapterId: moduleChapters[0]._id,
          isCompleted: false,
        };
        
        newModules.push(newModule);
        newChapters.push(...moduleChapters);
      }
      
      await this.moduleRepository.createMany(newModules);
      await this.chapterService.createChapters(newChapters);
      
      return { modules: newModules, chapters: newChapters };
    }, {
      service: "ModuleService",
      method: "cloneModulesForCourse"
    });
  }

  public async getModulesAndChaptersByCourseId(courseId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting modules and chapters for course", { courseId });

      type AggregationResult = {
        modules: Module[];
        chapters: Chapter[];
      }

      // Get modules with their chapters using aggregation
      const result = await this.moduleRepository.aggregate<AggregationResult>([
        // Match modules for this course
        { $match: { courseId } },
        // Sort modules by their order (assuming they have an order field)
        { $sort: { _id: 1 } },
        // Lookup chapters for each module
        {
          $lookup: {
            from: "chapters",
            localField: "_id",
            foreignField: "moduleId",
            as: "moduleChapters"
          }
        },
        // Group all results
        {
          $group: {
            _id: null,
            modules: { $push: "$$ROOT" },
            chapters: { $push: "$moduleChapters" }
          }
        },
        // Project to flatten chapters array and remove unnecessary fields
        {
          $project: {
            _id: 0,
            modules: {
              $map: {
                input: "$modules",
                as: "module",
                in: {
                  $mergeObjects: [
                    "$$module",
                    { moduleChapters: "$$REMOVE" }
                  ]
                }
              }
            },
            chapters: {
              $reduce: {
                input: "$chapters",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] }
              }
            }
          }
        }
      ]);

      // If no results, return empty arrays
      if (!result.length) {
        return { modules: [], chapters: [] };
      }

      return result[0];
    }, {
      service: "ModuleService",
      method: "getModulesAndChaptersByCourseId"
    });
  }
}
