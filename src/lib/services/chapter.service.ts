import { Logger, Chapter, ChapterRepository as ChapterRepositoryType, Course, Module } from "@/types"
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import LLMService from "./llm.service";
import { PromptProvider } from "../providers/prompt.provider";
import { chapterDetailGenerationSchema } from "@/lib/schemas";
import { AppError } from "../errorHandler/appError";
import {
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ModuleRepository } from "../repository/mongoose/module.mongoose.repository";
import CourseRepository from "../repository/mongoose/course.mongoose.repository";

export default class ChapterService {
  private logger: Logger;
  private static instance: ChapterService;
  private ChapterRepository: ChapterRepositoryType;
  private moduleRepository: ModuleRepository;
  private errorHandler: CentralErrorHandler;
  private llmService: LLMService;
  private courseRepository: CourseRepository;

  private constructor(
    logger: Logger,
    chapterRepository: ChapterRepositoryType,
    llmService: LLMService,
    moduleRepository: ModuleRepository,
    courseRepository: CourseRepository
  ) {
    this.logger = logger;
    this.ChapterRepository = chapterRepository;
    this.errorHandler = new CentralErrorHandler(logger);
    this.llmService = llmService;
    this.moduleRepository = moduleRepository
    this.courseRepository = courseRepository
  }

  public static getInstance(
    logger: Logger,
    chapterRepository: ChapterRepositoryType,
    llmService: LLMService,
    moduleRepository: ModuleRepository,
    courseRepository: CourseRepository
  ) {
    if (!this.instance) {
      const chapterService = new ChapterService(logger, chapterRepository, llmService, moduleRepository, courseRepository);
      this.instance = chapterService;
    }
    return this.instance
  }

  public async createChapters(chapters: Chapter[]) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Creating multiple Chapter", { chapters });
      return await this.ChapterRepository.createMany(chapters);
    }, {
      service: "ChapterService",
      method: "createChapters"
    })
  }

  public async getChaptersByModuleId(moduleId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting chapters by module ID", { moduleId });
      return await this.ChapterRepository.list({ moduleId });
    }, {
      service: "ChapterService",
      method: "getChaptersByModuleId"
    })
  }



  public async getChapterWithContent(chapterId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting chapter with content", { chapterId });

      const chapter = await this.ChapterRepository.get({ _id: chapterId });
      if (!chapter) {
        throw new AppError(404, "Chapter not found", "ChapterNotFound");
      }

      if (chapter.isGenerated) {
        this.logger.info("Chapter content already generated", { chapterId });
        return chapter;
      }

      this.logger.info("Generating chapter content", { chapterId, title: chapter.title });

      const moduleContext = await this.moduleRepository.get({ _id: chapter.moduleId });
      if (!moduleContext) {
        this.logger.error("Module context not found", { chapterId, moduleId: chapter.moduleId });
        throw new AppError(500, "Internal server error", "InternalError");
      }

      const courseContext = await this.courseRepository.get({ _id: moduleContext.courseId });
      if (!courseContext) {
        this.logger.error("Course context not found", { chapterId, courseId: moduleContext.courseId });
        throw new AppError(500, "Internal server error", "InternalError");
      }
      const moduleChapters = await this.ChapterRepository.list({ moduleId: chapter.moduleId });
      const sortedChapters = moduleChapters.sort((a, b) => {
        const aIndex = moduleContext.contents.indexOf(a._id);
        const bIndex = moduleContext.contents.indexOf(b._id);
        return aIndex - bIndex;
      });

      const chapterIndex = sortedChapters.findIndex(ch => ch._id === chapterId);
      const chapterPosition = chapterIndex + 1;
      const totalChapters = sortedChapters.length;

      const previousChapter = chapterIndex > 0 ? sortedChapters[chapterIndex - 1] : undefined;
      const nextChapter = chapterIndex < sortedChapters.length - 1 ? sortedChapters[chapterIndex + 1] : undefined;

      this.logger.info("Chapter flow context determined", {
        chapterId,
        chapterTitle: chapter.title,
        chapterPosition,
        totalChapters,
        previousChapterTitle: previousChapter?.title || "None (first chapter)",
        nextChapterTitle: nextChapter?.title || "None (last chapter)",
        moduleTitle: moduleContext.title,
        courseTitle: courseContext.title
      });

      const generationResult = (await this.llmService.structuredResponseWithFallback(
        this.getChapterGenerationMessages(
          chapter,
          courseContext,
          moduleContext,
          chapterPosition,
          totalChapters,
          previousChapter,
          nextChapter
        ),
        chapterDetailGenerationSchema,
        {
          provider: "openai",
          model: "gpt-4.1",
        }
      )).parsed;

      this.logger.info("Generated chapter content with flow integration", {
        chapterId,
        contentBlocks: generationResult.content.length,
        refs: generationResult.refs.length,
        contentTypes: [...new Set(generationResult.content.map(block => block.type))],
        flowIntegration: {
          previousChapter: previousChapter?.title,
          nextChapter: nextChapter?.title,
          position: `${chapterPosition}/${totalChapters}`
        }
      });

      const updatedChapter: Chapter = {
        ...chapter,
        content: generationResult.content,
        refs: generationResult.refs,
        isGenerated: true,
        estimatedTime: generationResult.estimatedTime
      };

      await this.ChapterRepository.update({ _id: chapterId }, updatedChapter);
      this.logger.info("Chapter content generated and saved successfully", {
        chapterId,
        contentBlocks: updatedChapter.content.length,
        flowContextUsed: {
          previous: previousChapter?.title,
          next: nextChapter?.title,
          position: chapterPosition
        }
      });

      return updatedChapter;
    }, {
      service: "ChapterService",
      method: "getChapterWithContent"
    });
  }

  private getChapterGenerationMessages(
    chapter: Chapter,
    courseContext: Course,
    moduleContext: Module,
    chapterPosition: number,
    totalChapters: number,
    previousChapter?: Chapter,
    nextChapter?: Chapter
  ) {
    const contextPrompt = this.buildEnhancedChapterContextPrompt(
      chapter,
      courseContext,
      moduleContext,
      chapterPosition,
      totalChapters,
      previousChapter,
      nextChapter
    );

    return [
      new SystemMessage(PromptProvider.getChapterContentGenerationPrompt()),
      new HumanMessage(contextPrompt)
    ];
  }

  private buildEnhancedChapterContextPrompt(
    chapter: Chapter,
    courseContext: Course,
    moduleContext: Module,
    chapterPosition: number,
    totalChapters: number,
    previousChapter?: Chapter,
    nextChapter?: Chapter
  ): string {
    return `
# Chapter Content Generation Context

## Course Information
**Title**: ${courseContext.title}
**Description**: ${courseContext.description}
**Difficulty Level**: ${courseContext.difficultyLevel}
**Technologies**: ${courseContext.technologies.join(", ")}
**Learning Objectives**: 
${courseContext.learningObjectives.map(obj => `- ${obj}`).join("\n")}

## Current Module Information
**Title**: ${moduleContext.title}
**Description**: ${moduleContext.description}
**Difficulty Level**: ${moduleContext.difficultyLevel}
**Prerequisites**: ${moduleContext.prerequisites.join(", ")}
**Learning Objectives**:
${moduleContext.learningObjectives.map(obj => `- ${obj}`).join("\n")}

## Current Chapter to Generate Content For
**Title**: ${chapter.title}
**Position**: Chapter ${chapterPosition} of ${totalChapters} in "${moduleContext.title}" module

## Learning Flow Context

### Chapter Progression
This chapter is positioned as **${chapterPosition}/${totalChapters}** in the module sequence.

${previousChapter ? `### Previous Chapter
**Title**: "${previousChapter.title}"

*Students will have completed this chapter before starting the current one. Build upon concepts introduced here and reference them where appropriate.*
` : `### Previous Chapter
*This is the FIRST chapter in the module. Serve as a strong foundation and introduction to the module's core concepts.*
`}

${nextChapter ? `### Next Chapter  
**Title**: "${nextChapter.title}"

*Students will proceed to this chapter after completing the current one. Prepare them for these upcoming concepts without overwhelming them.*
` : `### Next Chapter
*This is the FINAL chapter in the module. Provide a comprehensive conclusion and prepare students for the next module or course completion.*
`}

## Content Generation Instructions

Generate comprehensive, detailed content for the current chapter "${chapter.title}".

**Critical Flow Integration Requirements:**
1. **Build from Previous**: ${previousChapter ? `Reference and build upon concepts from "${previousChapter.title}"` : "Establish strong foundational concepts as this is the first chapter"}
2. **Prepare for Next**: ${nextChapter ? `Introduce or hint at concepts that will be explored in "${nextChapter.title}"` : "Provide comprehensive closure and synthesis of all module concepts"}
3. **Position Awareness**: This is chapter ${chapterPosition} of ${totalChapters}, so ${chapterPosition === 1 ? "focus on clear foundations and engagement" :
        chapterPosition === totalChapters ? "emphasize synthesis and practical application" :
          "maintain momentum while building complexity appropriately"
      }

**Technical Requirements:**
- Use the course technologies: ${courseContext.technologies.join(", ")}
- Match the ${courseContext.difficultyLevel} difficulty level
- Align with module learning objectives
- Include practical, working code examples
- Provide real-world context and applications
- Create content that takes approximately 45-75 minutes to complete thoroughly

**Content Structure:**
- Start with a brief connection to previous learning (if applicable)
- Present main concepts with clear explanations
- Include interactive code examples and diagrams where beneficial
- End with a clear transition that prepares for upcoming content (if applicable)
- Ensure content flows naturally within the module's learning progression

**Learning Experience:**
Students should feel a sense of natural progression from the previous chapter and clear preparation for what comes next. The content should feel like an integral part of a cohesive learning journey rather than an isolated lesson.
    `;
  }


  public async getChapter(chapterId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting chapter", { chapterId });
      const chapter = await this.ChapterRepository.get({ _id: chapterId });
      if (!chapter) {
        throw new AppError(404, "Chapter not found", "ChapterNotFound");
      }
      return chapter;
    }, {
      service: "ChapterService",
      method: "getChapter"
    });
  }

  public async updateChapter(chapterId: string, updateData: Partial<Chapter>) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Updating chapter", { chapterId, updateData });

      const chapter = await this.ChapterRepository.get({ _id: chapterId });
      if (!chapter) {
        throw new AppError(404, "Chapter not found", "ChapterNotFound");
      }

      const updatedChapter = { ...chapter, ...updateData };
      await this.ChapterRepository.update({ _id: chapterId }, updatedChapter);

      this.logger.info("Chapter updated successfully", { chapterId });
      return updatedChapter;
    }, {
      service: "ChapterService",
      method: "updateChapter"
    });
  }
}
