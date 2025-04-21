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
  moduleContentSchema,
  courseGenerationSchema
} from "@/lib/schemas";
import ModuleService from "./module.service";
import QuizService from "./quiz.service";
import ChapterService from "./chapter.service";
import IconsProvider from "../providers/icons.provider";
import VectorDbService from "./vectorDb.service";



export default class CourseService {
  private logger: Logger;
  private static instance: CourseService;
  private courseRepository: CourseRepositoryType;
  private errorHandler: CentralErrorHandler;
  private llmService: LLMService;
  private moduleService: ModuleService;
  private quizService: QuizService;
  private chapterService: ChapterService;
  private iconProvider: IconsProvider

  private constructor(
    logger: Logger,
    courseRepository: CourseRepositoryType,
    moduleService: ModuleService,
    quizService: QuizService,
    chapterService: ChapterService,
    llmService: LLMService,
    vectorDbService: VectorDbService
  ) {
    this.logger = logger;
    this.courseRepository = courseRepository;
    this.errorHandler = new CentralErrorHandler(logger);
    this.llmService = llmService;
    this.moduleService = moduleService;
    this.quizService = quizService;
    this.iconProvider = IconsProvider.getInstance(vectorDbService)
    this.chapterService = chapterService;
  }

  public static getInstance(
    logger: Logger,
    courseRepository: CourseRepositoryType,
    moduleService: ModuleService,
    quizService: QuizService,
    chapterService: ChapterService,
    llmService: LLMService,
    vectorDbService: VectorDbService
  ) {
    if (!this.instance) {
      const courseService = new CourseService(
        logger,
        courseRepository,
        moduleService,
        quizService,
        chapterService,
        llmService,
        vectorDbService
      );
      this.instance = courseService;
    }
    return this.instance;
  }

  // generate course structure
  //  - create course --done
  // pass down to module service to generate module
  //  - create module
  // pass down to quiz/ chapter service to save chapter / quiz 

  private async getCourseFromGeneratedCourseData(courseData: NewCourse, courseGenerationResult: CourseGenreation) {
    const courseId = new mongoose.Types.ObjectId().toString()
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
      moduleIds: [],
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
        model: "o4-mini",
      });
      this.logger.info("Generated course", { courseGenerationResult })
      const course = await this.getCourseFromGeneratedCourseData(courseData, courseGenerationResult);
      return course
      // await this.courseRepository.create(course);
    }, {
      service: "CourseService",
      method: "createCourse"
    });
  }

}
