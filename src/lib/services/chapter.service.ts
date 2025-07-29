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
import VideoService from "./video.service";
import RealtimeService from "./realtime.service";

export default class ChapterService {
  private logger: Logger;
  private static instance: ChapterService;
  private ChapterRepository: ChapterRepositoryType;
  private moduleRepository: ModuleRepository;
  private errorHandler: CentralErrorHandler;
  private llmService: LLMService;
  private courseRepository: CourseRepository;
  private videoService: VideoService;
  private realtimeService: RealtimeService;

  private constructor(
    logger: Logger,
    chapterRepository: ChapterRepositoryType,
    llmService: LLMService,
    moduleRepository: ModuleRepository,
    courseRepository: CourseRepository,
    videoService: VideoService,
    realtimeSerivce: RealtimeService,

  ) {
    this.logger = logger;
    this.ChapterRepository = chapterRepository;
    this.errorHandler = new CentralErrorHandler(logger);
    this.llmService = llmService;
    this.moduleRepository = moduleRepository
    this.courseRepository = courseRepository
    this.videoService = videoService
    this.realtimeService = realtimeSerivce
  }

  public static getInstance(
    logger: Logger,
    chapterRepository: ChapterRepositoryType,
    llmService: LLMService,
    moduleRepository: ModuleRepository,
    courseRepository: CourseRepository,
    videoService: VideoService,
    realtimeService: RealtimeService
  ) {
    if (!this.instance) {
      const chapterService = new ChapterService(logger, chapterRepository, llmService, moduleRepository, courseRepository, videoService, realtimeService);
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

  public async getChapterWithContent(chapterId: string, addVideo: boolean) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting chapter with content", { chapterId, addVideo });

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
          addVideo,
          totalChapters,
          previousChapter,
          nextChapter
        ),
        chapterDetailGenerationSchema,
        {
          provider: "openai",
          model: "o3",
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

      // Process content blocks (including video generation if needed)
      const processedContent = await this.processContentBlocks(
        generationResult.content,
        chapterId,
        addVideo
      );

      const updatedChapter: Chapter = {
        ...chapter,
        content: processedContent,
        refs: generationResult.refs,
        isGenerated: true,
        estimatedTime: generationResult.estimatedTime
      };

      await this.ChapterRepository.update({ _id: chapterId }, updatedChapter);

      const videoBlocksCount = processedContent.filter(block => block.type === "video").length;

      this.logger.info("Chapter content generated and saved successfully", {
        chapterId,
        contentBlocks: updatedChapter.content.length,
        videoBlocks: videoBlocksCount,
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

  private async processContentBlocks(
    contentBlocks: any[],
    chapterId: string,
    addVideo: boolean
  ): Promise<any[]> {
    return Promise.all(
      contentBlocks.map(async (contentBlock, index) => {
        if (contentBlock.type === "video" && addVideo) {
          return this.processVideoBlock(contentBlock, chapterId, index);
        }

        return contentBlock;
      })
    );
  }

  private async processVideoBlock(
    contentBlock: any,
    chapterId: string,
    blockIndex: number
  ): Promise<any> {
    try {
      if (!contentBlock.videoQuery) {
        this.logger.warn("Video block missing videoQuery", {
          chapterId,
          blockIndex,
          contentBlock
        });

        return this.createVideoFailureBlock("Video query not provided by content generator");
      }

      this.logger.info("Generating video for content block", {
        chapterId,
        blockIndex,
        videoQuery: contentBlock.videoQuery,
        programmingLanguage: contentBlock.programmingLanguage
      });

      const videoOptions: { lang?: string } = {};
      if (contentBlock.programmingLanguage) {
        videoOptions.lang = contentBlock.programmingLanguage;
      }

      const videoResult = await this.videoService.getVideo(
        contentBlock.videoQuery,
        videoOptions
      );

      this.logger.info("Video generated successfully", {
        chapterId,
        blockIndex,
        videoUrl: videoResult.url,
        videoQuery: contentBlock.videoQuery
      });

      return {
        ...contentBlock,
        content: videoResult.url,
        type: "video" as const
      };

    } catch (error) {
      this.logger.error("Failed to generate video for content block", {
        chapterId,
        blockIndex,
        videoQuery: contentBlock.videoQuery,
        programmingLanguage: contentBlock.programmingLanguage,
        error: error.message
      });

      return this.createVideoFailureBlock(`Video generation failed: ${error.message}`);
    }
  }

  private createVideoFailureBlock(reason: string): any {
    return {
      type: "text" as const,
      content: `**Video Content Unavailable**\n\n${reason}. Please refer to the text and code examples for understanding this concept.`
    };
  }


  private getChapterGenerationMessages(
    chapter: Chapter,
    courseContext: Course,
    moduleContext: Module,
    chapterPosition: number,
    addVideo: boolean,
    totalChapters: number,
    previousChapter?: Chapter,
    nextChapter?: Chapter,
  ) {
    const contextPrompt = this.buildEnhancedChapterContextPrompt(
      chapter,
      courseContext,
      moduleContext,
      chapterPosition,
      addVideo,
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
    addVideo: boolean,
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

### ${!addVideo && "DO NOT ATTACH VIDEO TO THIS CHAPTER"}

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

  public async handleNext(chapterId: string, moduleId: string, courseId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Handling next chapter", { chapterId, moduleId, courseId });

      const course = await this.courseRepository.get({ _id: courseId });
      if (!course) {
        throw new AppError(404, "Invalid course", "CourseNotFound");
      }

      const module = await this.moduleRepository.get({ _id: moduleId });
      if (!module) {
        this.logger.error("Module not found", { moduleId });
        throw new AppError(404, "Invalid module", "ModuleNotFound");
      }

      const chapter = await this.ChapterRepository.get({ _id: chapterId });
      if (!chapter) {
        throw new AppError(404, "Chapter not found", "ChapterNotFound");
      }

      const currentChapterIndex = module.contents.findIndex((id) => id === chapter._id.toString());
      const currentModuleIndex = course.moduleIds.findIndex((id) => id === module._id.toString());

      if (currentChapterIndex === -1) {
        this.logger.error("Chapter not found in module contents", { chapterId, moduleId });
        throw new AppError(400, "Chapter does not belong to this module", "InvalidChapterModule");
      }

      if (currentModuleIndex === -1) {
        this.logger.error("Module not found in course", { moduleId, courseId });
        throw new AppError(400, "Module does not belong to this course", "InvalidModuleCourse");
      }

      this.logger.info("Current positions found", {
        currentChapterIndex,
        currentModuleIndex,
        totalChapters: module.contents.length,
        totalModules: course.moduleIds.length
      });

      const isLastChapterInModule = currentChapterIndex === module.contents.length - 1;
      const isLastModuleInCourse = currentModuleIndex === course.moduleIds.length - 1;

      this.logger.info("Navigation flags", { isLastChapterInModule, isLastModuleInCourse });

      await this.ChapterRepository.update({ _id: chapterId }, { isCompleted: true });
      this.logger.info("Chapter marked as completed", { chapterId });

      let nextChapterId: string | null = null;
      let nextModuleId: string | null = null;
      let moduleCompleted = false;
      let courseCompleted = false;

      if (isLastChapterInModule && isLastModuleInCourse) {
        this.logger.info("Course completed - last chapter of last module", { courseId });
        await this.moduleRepository.update({ _id: moduleId }, { isCompleted: true });
        this.logger.info("Final module marked as completed", { moduleId });
        moduleCompleted = true;
        courseCompleted = true;

      } else if (isLastChapterInModule && !isLastModuleInCourse) {
        this.logger.info("Moving to next module", { currentModuleIndex });

        await this.moduleRepository.update({ _id: moduleId }, { isCompleted: true });
        this.logger.info("Current module marked as completed", { moduleId });
        moduleCompleted = true;

        nextModuleId = course.moduleIds[currentModuleIndex + 1];
        this.logger.info("Next module identified", { nextModuleId });

        const nextModule = await this.moduleRepository.get({ _id: nextModuleId });
        if (!nextModule) {
          throw new AppError(404, "Next module not found", "NextModuleNotFound");
        }

        if (nextModule.contents.length === 0) {
          throw new AppError(400, "Next module has no chapters", "EmptyNextModule");
        }

        await this.moduleRepository.update({ _id: nextModuleId }, {
          isLocked: false,
          currentChapterId: nextModule.contents[0]
        });
        this.logger.info("Next module unlocked", { nextModuleId });

        nextChapterId = nextModule.contents[0];
        this.logger.info("First chapter of next module identified", { nextChapterId });

        await this.ChapterRepository.update({ _id: nextChapterId }, {
          isLocked: false,
          isActive: true
        });
        this.logger.info("First chapter of next module unlocked and activated", { nextChapterId });

        await this.courseRepository.update({ _id: courseId }, { currentModuleId: nextModuleId });
        this.logger.info("Course current module updated", { courseId, currentModuleId: nextModuleId });

      } else if (!isLastChapterInModule) {
        nextChapterId = module.contents[currentChapterIndex + 1];
        this.logger.info("Next chapter in current module identified", { nextChapterId });

        await this.moduleRepository.update({ _id: moduleId }, { currentChapterId: nextChapterId });
        this.logger.info("Module current chapter updated", { moduleId, currentChapterId: nextChapterId });

        const nextChapter = await this.ChapterRepository.get({ _id: nextChapterId });
        if (nextChapter && nextChapter.isLocked) {
          await this.ChapterRepository.update({ _id: nextChapterId }, {
            isLocked: false,
            isActive: true
          });
          this.logger.info("Next chapter unlocked and activated", { nextChapterId });
        } else if (nextChapter) {
          await this.ChapterRepository.update({ _id: nextChapterId }, { isActive: true });
          this.logger.info("Next chapter activated", { nextChapterId });
        }
      }

      await this.ChapterRepository.update({ _id: chapterId }, { isActive: false });
      this.logger.info("Current chapter deactivated", { chapterId });

      const result = {
        nextChapterId,
        nextModuleId,
        moduleCompleted,
        courseCompleted,
        currentChapterId: chapterId
      };

      this.logger.info("Successfully handled next chapter", result);
      return result;

    }, {
      service: "ChapterService",
      method: "handleNext"
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

  public async updateMermaidContent(chapterId: string, content: string, contentId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Updating mermaid content", { chapterId, content, contentId });
      this.ChapterRepository.update({ _id: chapterId }, {
        $set: {
          "content.$[elem].content": content
        }
      },
        {
          arrayFilters: [{ "elem._id": contentId }],
          new: true
        });
    }, {
      service: "ChapterService",
      method: "updateMermaidContent"
    })
  }
}
