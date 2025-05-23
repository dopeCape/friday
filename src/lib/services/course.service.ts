import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { Chapter, Course, CourseGenreation, DifficultyLevel, Logger, Module, NewCourse, Quiz, WithoutId } from "@/types";
import { CourseRepository as CourseRepositoryType } from "@/types";
import LLMService from "./llm.service";
import { PromptProvider } from "../providers/prompt.provider";
import mongoose from "mongoose";
import {
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import {
  courseGenerationSchema
} from "@/lib/schemas";
import ModuleService from "./module.service";
import IconsProvider from "../providers/icons.provider";



export default class CourseService {
  private logger: Logger;
  private static instance: CourseService;
  private courseRepository: CourseRepositoryType;
  private errorHandler: CentralErrorHandler;
  private llmService: LLMService;
  private moduleService: ModuleService;
  private iconProvider: IconsProvider

  private constructor(
    logger: Logger,
    courseRepository: CourseRepositoryType,
    moduleService: ModuleService,
    llmService: LLMService,
    iconProvider: IconsProvider
  ) {
    this.logger = logger;
    this.courseRepository = courseRepository;
    this.errorHandler = new CentralErrorHandler(logger);
    this.llmService = llmService;
    this.moduleService = moduleService;
    this.iconProvider = iconProvider
  }

  public static getInstance(
    logger: Logger,
    courseRepository: CourseRepositoryType,
    moduleService: ModuleService,
    llmService: LLMService,
    iconProvider: IconsProvider
  ) {
    if (!this.instance) {
      const courseService = new CourseService(
        logger,
        courseRepository,
        moduleService,
        llmService,
        iconProvider
      );
      this.instance = courseService;
    }
    return this.instance;
  }


  private async getCourseFromGeneratedCourseData(courseData: NewCourse, courseId: string, courseGenerationResult: CourseGenreation, moduleIds: string[]) {
    const course: Course = {
      _id: courseId,
      title: courseGenerationResult.title,
      description: courseGenerationResult.description,
      isPrivate: courseData.isPrivate,
      icon: await this.iconProvider.searchIcons(courseGenerationResult.iconQuery.map(query => query.join(","))),
      createdBy: courseData.userId,
      isSystemGenerated: courseData.isSystemGenerated,
      technologies: courseGenerationResult.technologies,
      internalDescription: courseGenerationResult.internalDescription,
      moduleIds,
      isEnhanced: courseData.isEnhanced,
      difficultyLevel: courseGenerationResult.difficultyLevel,
      prerequisites: courseGenerationResult.prerequisites,
      estimatedCompletionTime: courseGenerationResult.estimatedCompletionTime,
      learningObjectives: courseGenerationResult.learningObjectives,
      keywords: courseGenerationResult.keywords,
    }
    return course

  }
  private getCouseGenerationMessages(userQuery: string) {
    const systemMessage = new SystemMessage(PromptProvider.getCourseStructureGenerationPrompt())
    const userMessage = new HumanMessage(userQuery);
    return [systemMessage, userMessage]
  }
  public async createCourse(courseData: NewCourse) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Generating course", { courseData });
      const courseGenerationResult = await this.llmService.structuredRespose(this.getCouseGenerationMessages(courseData.prompt), courseGenerationSchema, {
        provider: "openai",
        model: "gpt-4o-mini",
      });
      this.logger.info("Generated course", { courseGenerationResult })
      const courseId = new mongoose.Types.ObjectId().toString()
      const { modules, chapters } = await this.moduleService.createModules(courseGenerationResult.modules, courseId)
      const course = await this.getCourseFromGeneratedCourseData(courseData, courseId, courseGenerationResult, modules.map(module => module._id));
      await this.courseRepository.create(course);
      return { course, modules, chapters }
    }, {
      service: "CourseService",
      method: "createCourse"
    });
  }

}
