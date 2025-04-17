import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { Chapter, Course, CourseGenreation, Logger, Module, NewCourse, Quiz, WithoutId } from "@/types"
import { CourseRepository as CourseRepositoryType } from "@/types";
import LLMService from "./llm.service";
import { PromtProvider } from "../providers/prompt.provider";
import mongoose from "mongoose"
import {
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { courseGenerationSchema } from "../schemas";
import ModuleService from "./module.service";
import QuizService from "./quiz.service";
import ChapterService from "./chapter.service";

export default class CourseService {
  private logger: Logger;
  private static instance: CourseService;
  private courseRepositor: CourseRepositoryType;
  private errorHandler: CentralErrorHandler;
  private llmService: LLMService;
  private moduleService: ModuleService
  private quizService: QuizService
  private chapterService: ChapterService

  private constructor(logger: Logger, courseRepository: CourseRepositoryType, moduleService: ModuleService, quizService: QuizService, chapterService: ChapterService, llmService: LLMService) {
    this.logger = logger;
    this.courseRepositor = courseRepository;
    this.errorHandler = new CentralErrorHandler(logger);
    this.llmService = llmService
    this.moduleService = moduleService
    this.quizService = quizService;
    this.chapterService = chapterService
  }

  public static getInstance(logger: Logger, courseRepositor: CourseRepositoryType, moduleService: ModuleService, quizService: QuizService, chapterService: ChapterService, llmService: LLMService) {
    if (!this.instance) {
      const courseService = new CourseService(logger, courseRepositor, moduleService, quizService, chapterService, llmService);
      this.instance = courseService;
    }
    return this.instance
  }

  private getCourseGenerationInput(userQuery: string) {
    const generationPrompt = PromtProvider.getCourseGenerationSystemPrompt()
    const systemMessage = new SystemMessage(generationPrompt);
    const userMessage = new HumanMessage(userQuery);
    const message = [
      systemMessage,
      userMessage
    ]
    return message
  }
  private getCourseDataFromGeneratedResponse(courseData: NewCourse, generatedCourse: CourseGenreation) {
    const course: WithoutId<Course> = {
      title: generatedCourse.title,
      description: generatedCourse.description,
      isPrivate: courseData.isPrivate,
      icon: generatedCourse.icon,
      createdBy: courseData.userId,
      isSystemGenerated: courseData.isSystemGenerated,
      technologies: generatedCourse.technologies,
      internalDescription: generatedCourse.internalDescription,
      isEnhanced: courseData.isEnhanced,
      difficultyLevel: generatedCourse.difficultyLevel,
      prerequisites: generatedCourse.prerequisites,
      estimatedCompletionTime: generatedCourse.estimatedCompletionTime,
      learningObjectives: generatedCourse.learningObjectives,
      keywords: generatedCourse.keywords,
      communityResources: generatedCourse.communityResources,
      moduleIds: [],
    }
    return course
  }
  private createModulesFromGeneratedResponse(generatedCourse: CourseGenreation, contentIds: string[], courseId: string, courseData: NewCourse) {
    const modules: Module[] = [];
    const allChapters: Chapter[] = [];
    const allQuizs: Quiz[] = [];
    const moduleIds: string[] = [];
    generatedCourse.modules.forEach((module) => {
      const moduleId = new mongoose.Types.ObjectId().toString()
      const contentIds: string[] = [];
      const chapters: Chapter[] = [];
      moduleIds.push(moduleId);
      module.chapters.forEach((chapter) => {
        const id = new mongoose.Types.ObjectId().toString()
        contentIds.push(id);
        chapters.push({
          _id: id,
          title: chapter.title,
          content: [],
          isGenerated: false,
          refs: chapter.references,
          type: "chapter",
          moduleId: moduleId,
          isCompleted: false,
        })
      })
      const quizeId = new mongoose.Types.ObjectId().toString()
      contentIds.push(quizeId);
      const quize: Quiz = {
        _id: quizeId,
        moduleId,
        questions: module.quize.questions.map(q => {
          const questionId = new mongoose.Types.ObjectId().toString()
          return {
            _id: questionId,
            question: q.question,
            answerType: q.answerType,
            isCorrect: false,
            isAnswered: false,
            options: q.options,
            codeBlockType: q.codeBlockType,
            explanation: q.explanation,
            difficulty: q.difficulty,
            hints: q.hints,
          }
        }),
        type: "quiz",
        passingScore: module.quize.passingScore,
        maxAttempts: module.quize.maxAttempts,
        currentScore: 0,
      }
      allQuizs.push(quize)
      allChapters.push(...chapters)
      modules.push({
        title: module.title,
        _id: moduleId,
        description: module.description,
        courseId,
        refs: module.references,
        contents: contentIds,
        isLocked: courseData.isEnhanced,
        isCompleted: false,
        currentChapterId: contentIds[0],
        icon: module.icon,
        difficultyLevel: module.difficultyLevel,
        prerequisites: module.prerequisites,
        estimatedCompletionTime: module.estimatedCompletionTime,
        learningObjectives: module.learningObjectives,
        moduleType: "content",
      })
    })
    return { modules, quizs: allQuizs, chapters: allChapters }
  }
  public async createCourse(courseData: NewCourse) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Generating course", { courseData });
      const generationMessage = this.getCourseGenerationInput(courseData.prompt)
      const generatedCourse = await this.llmService.structuredRespose(generationMessage, courseGenerationSchema, {
        model: "gpt-4o-mini",
        provider: "openai",
      })
      this.logger.info("Generated course", { generatedCourse });
      const course = this.getCourseDataFromGeneratedResponse(courseData, generatedCourse)
      this.logger.info("Creating course in db ", { course })
      const savedCourse = await this.courseRepositor.create(course);
      const { modules, quizs, chapters } = this.createModulesFromGeneratedResponse(generatedCourse, [], savedCourse._id, courseData);
      await this.moduleService.createModules(modules);
      await this.quizService.createQuizs(quizs);
      await this.chapterService.createChapters(chapters);
      return { course, modules, quizs, chapters };
    }, {
      service: "CourseService",
      method: "createCourse"
    })
  }
}

