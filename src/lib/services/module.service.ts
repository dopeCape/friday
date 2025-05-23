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
      this.logger.info("reating prompt for module generation", { modules })
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
      this.logger.info("module generateion propmt ", {
        systemMessage,
        humanMessage
      })
      return [systemMessage, humanMessage]
    }, {
      service: "ModuleService",
      method: "getModuleGenerationPrompt"
    })

  }
  private async createModuleFromGeneratedData(moduleData: GeneratedModuleData, courseId: string, moduleId: string, content: string[], isLocked: boolean): Promise<Module> {
    const refs: string[] = [];
    await Promise.all(moduleData.refs.map(async (ref) => {
      const searchResults = await this.searchService.search(ref)
      if (searchResults.results) {
        refs.push(searchResults.results[0].url)
      }
    }))
    return {
      title: moduleData.title,
      _id: moduleId,
      description: moduleData.description,
      courseId: courseId,
      refs,
      contents: content,
      isLocked: isLocked,
      isCompleted: false,
      currentChapterId: content[0],
      icon: await this.iconProvider.searchIcon(moduleData.iconQuery),
      difficultyLevel: moduleData.difficultyLevel,
      prerequisites: moduleData.prerequisites,
      estimatedCompletionTime: moduleData.estimatedCompletionTime,
      learningObjectives: moduleData.learningObjectives,
      moduleType: "content",
    }
  }


  public async createModules(modules: ModuleGenerationData[], courseId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Generating module", { modules });
      const startIndex = 0;
      const lastIndex = modules.length - 1;
      const createdModules: Record<number, Module> = {};
      const createdChapters: Chapter[] = [];

      const generationResults = await Promise.all(modules.map(async (module, index) => {
        const moduleGenerationContext = [];
        const moduleId = new mongoose.Types.ObjectId().toString();
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

        return { generatedModule, moduleId, index };
      }));

      const iconQueries = generationResults.map(result => result.generatedModule.iconQuery);
      const icons = await this.iconProvider.searchIconsBatch(iconQueries);

      await Promise.all(generationResults.map(async (result, idx) => {
        const { generatedModule, moduleId, index } = result;

        const chapters: Chapter[] = generatedModule.chapters.map(chapter => ({
          _id: new mongoose.Types.ObjectId().toString(),
          title: chapter.title,
          content: [],
          isGenerated: false,
          refs: [],
          moduleId,
          type: "chapter",
          isCompleted: false,
        }));

        const chapterIds = chapters.map(ch => ch._id);
        const createdModule = await this.createModuleFromGeneratedDataWithIcon(
          generatedModule,
          courseId,
          moduleId,
          chapterIds,
          index !== 0,
          icons[idx]
        );

        createdChapters.push(...chapters);
        createdModules[index] = createdModule;
      }));

      const moduleArray = Object.keys(createdModules)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(key => createdModules[parseInt(key)]);

      await this.moduleRepository.createMany(moduleArray);
      await this.chapterService.createChapters(createdChapters);

      return { modules: moduleArray, chapters: createdChapters }
    }, {
      service: "ModuleService",
      method: "createModule"
    })
  }

  private async createModuleFromGeneratedDataWithIcon(
    moduleData: GeneratedModuleData,
    courseId: string,
    moduleId: string,
    content: string[],
    isLocked: boolean,
    icon: string
  ): Promise<Module> {
    const refs: string[] = [];
    await Promise.all(moduleData.refs.map(async (ref) => {
      const searchResults = await this.searchService.search(ref)
      if (searchResults.results) {
        refs.push(searchResults.results[0].url)
      }
    }))

    return {
      title: moduleData.title,
      _id: moduleId,
      description: moduleData.description,
      courseId: courseId,
      refs,
      contents: content,
      isLocked: isLocked,
      isCompleted: false,
      currentChapterId: content[0],
      icon,
      difficultyLevel: moduleData.difficultyLevel,
      prerequisites: moduleData.prerequisites,
      estimatedCompletionTime: moduleData.estimatedCompletionTime,
      learningObjectives: moduleData.learningObjectives,
      moduleType: "content",
    }
  }
}
