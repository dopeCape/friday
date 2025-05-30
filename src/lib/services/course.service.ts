import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { Course, CourseGenreation, Logger, NewCourse } from "@/types";
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
import { AppError } from "../errorHandler/appError";

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

  private async getCourseFromGeneratedCourseData(
    courseData: NewCourse,
    courseId: string,
    courseGenerationResult: CourseGenreation,
    moduleIds: string[],
    isTemplate: boolean = false
  ) {
    const iconQueries = courseGenerationResult.iconQuery.map(query => query.join(","));
    const icons = await this.iconProvider.searchIconsBatch(iconQueries);

    const course: Course = {
      _id: courseId,
      title: courseGenerationResult.title,
      description: courseGenerationResult.description,
      isPrivate: courseData.isPrivate,
      isUnique: isTemplate,
      icon: icons,
      createdBy: isTemplate ? "template" : courseData.userId,
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

  private async findMatchingTemplate(courseGenerationResult: CourseGenreation) {
    // Search for a matching template based on title and content similarity
    const existingTemplate = await this.courseRepository.get({
      createdBy: "template",
      title: courseGenerationResult.title,
      isPrivate: false
    });
    return existingTemplate;
  }

  public async createCourseFromTemplate(templateId: string, userId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Creating course from template", { templateId, userId });

      // Get the template course
      const templateCourse = await this.courseRepository.get({ _id: templateId });
      if (!templateCourse) {
        throw new AppError(404, "Template course not found", "TemplateNotFound");
      }

      // Verify it's a template and is unique
      if (templateCourse.createdBy !== "template" || !templateCourse.isUnique) {
        throw new AppError(404, "Invalid template course", "InvalidTemplate");
      }

      // Create new course ID
      const newCourseId = new mongoose.Types.ObjectId().toString();

      // Clone modules and chapters
      const { modules, chapters } = await this.moduleService.cloneModulesForCourse(templateId, newCourseId);

      // Create the new course
      const newCourse: Course = {
        ...templateCourse,
        _id: newCourseId,
        isUnique: false,
        isPrivate: true,
        createdBy: userId,
        moduleIds: modules.map(m => m._id),
      };

      await this.courseRepository.create(newCourse);

      return { course: newCourse, modules, chapters };
    }, {
      service: "CourseService",
      method: "createCourseFromTemplate"
    });
  }

  public async createCourse(courseData: NewCourse) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Generating course", { courseData });

      // Generate course structure
      const courseGenerationResult = await this.llmService.structuredRespose(
        this.getCouseGenerationMessages(courseData.prompt),
        courseGenerationSchema,
        {
          provider: "openai",
          model: "gpt-4o-mini",
        }
      );

      this.logger.info("Generated course structure", { courseGenerationResult });

      const courseId = new mongoose.Types.ObjectId().toString();
      let modules, chapters;

      if (!courseData.isPrivate) {
        const templateId = new mongoose.Types.ObjectId().toString();

        const templateResult = await this.moduleService.createModules(
          courseGenerationResult.modules as any,
          templateId,
          true
        );

        const templateCourse = await this.getCourseFromGeneratedCourseData(
          courseData,
          templateId,
          courseGenerationResult,
          templateResult.modules.map(module => module._id),
          true
        );
        await this.courseRepository.create(templateCourse);
        const result = await this.moduleService.cloneModulesForCourse(templateId, courseId);
        modules = result.modules;
        chapters = result.chapters;
      } else {
        const result = await this.moduleService.createModules(
          courseGenerationResult.modules as any,
          courseId,
          false
        );
        modules = result.modules;
        chapters = result.chapters;
      }

      // Create the user's course
      const course = await this.getCourseFromGeneratedCourseData(
        courseData,
        courseId,
        courseGenerationResult,
        modules.map(module => module._id)
      );
      await this.courseRepository.create(course);

      return { course, modules, chapters };
    }, {
      service: "CourseService",
      method: "createCourse"
    });
  }

  public async getCourse(id: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting course", { id });
      const course = await this.courseRepository.get({ _id: id });
      if (!course) {
        throw new AppError(404, "Course not found", "CourseDoesNotExists");
      }
      this.logger.info("Got course in db", { id });
      return course
    }, {
      service: "CourseService",
      method: "getCourse"
    })
  }

  public async getCourseWithContent(id: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting course with content", { id });

      // Get the course
      const course = await this.courseRepository.get({ _id: id });
      if (!course) {
        throw new AppError(404, "Course not found", "CourseDoesNotExists");
      }

      // Get modules and chapters
      const { modules, chapters } = await this.moduleService.getModulesAndChaptersByCourseId(id);

      this.logger.info("Got course with content", {
        id,
        moduleCount: modules.length,
        chapterCount: chapters.length
      });

      return { course, modules, chapters };
    }, {
      service: "CourseService",
      method: "getCourseWithContent"
    });
  }
}
