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

      const templateCourse = await this.courseRepository.get({ _id: templateId });
      if (!templateCourse) {
        throw new AppError(404, "Template course not found", "TemplateNotFound");
      }

      if (templateCourse.createdBy !== "template" || !templateCourse.isUnique) {
        throw new AppError(404, "Invalid template course", "InvalidTemplate");
      }

      const newCourseId = new mongoose.Types.ObjectId().toString();

      const { modules, chapters } = await this.moduleService.cloneModulesForCourse(templateId, newCourseId);

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

      const courseGenerationResult = (await this.llmService.structuredResponse(
        this.getCouseGenerationMessages(courseData.prompt),
        courseGenerationSchema,
        {
          provider: "openai",
          model: "o3",
        }
      )).parsed;

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

      const course = await this.courseRepository.get({ _id: id });
      if (!course) {
        throw new AppError(404, "Course not found", "CourseDoesNotExists");
      }
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




  public async getUserCourses(userId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting all courses for user", { userId });

      const courses = await this.courseRepository.list({
        createdBy: userId
      });

      if (!courses || courses.length === 0) {
        this.logger.info("No courses found for user", { userId });
        return [];
      }

      this.logger.info("Found courses for user", {
        userId,
        courseCount: courses.length
      });

      const coursesWithContent = await Promise.all(
        courses.map(async (course) => {
          try {
            const { modules, chapters } = await this.moduleService.getModulesAndChaptersByCourseId(course._id);

            const totalModules = modules.length;
            const completedModules = modules.filter(m => m.isCompleted).length;
            const totalChapters = chapters.length;
            const completedChapters = chapters.filter(c => c.isCompleted).length;

            return {
              course,
              modules,
              chapters,
              progress: {
                totalModules,
                completedModules,
                totalChapters,
                completedChapters,
                moduleProgress: totalModules > 0 ? (completedModules / totalModules) * 100 : 0,
                chapterProgress: totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0
              }
            };
          } catch (error) {
            this.logger.error("Failed to get content for course", {
              courseId: course._id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });

            return {
              course,
              modules: [],
              chapters: [],
              progress: {
                totalModules: 0,
                completedModules: 0,
                totalChapters: 0,
                completedChapters: 0,
                moduleProgress: 0,
                chapterProgress: 0
              }
            };
          }
        })
      );

      const sortedCourses = coursesWithContent.sort((a, b) => {
        const aInProgress = a.progress.moduleProgress > 0 && a.progress.moduleProgress < 100;
        const bInProgress = b.progress.moduleProgress > 0 && b.progress.moduleProgress < 100;

        if (aInProgress && !bInProgress) return -1;
        if (!aInProgress && bInProgress) return 1;

        return b.course._id.localeCompare(a.course._id);
      });

      this.logger.info("Successfully retrieved all courses with content for user", {
        userId,
        totalCourses: sortedCourses.length,
        totalModules: sortedCourses.reduce((sum, c) => sum + c.modules.length, 0),
        totalChapters: sortedCourses.reduce((sum, c) => sum + c.chapters.length, 0)
      });

      return sortedCourses;
    }, {
      service: "CourseService",
      method: "getUserCourses"
    });
  }

  public async getUserCoursesBasic(userId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting basic course info for user", { userId });

      const courses = await this.courseRepository.list({
        createdBy: userId
      });
      if (!courses || courses.length === 0) {
        this.logger.info("No courses found for user", { userId });
        return [];
      }

      const coursesWithBasicProgress = await Promise.all(
        courses.map(async (course) => {
          try {
            const modules = await this.moduleService.getModulesByCourseId(course._id);
            const completedModules = modules.filter(m => m.isCompleted).length;

            return {
              ...course,
              progress: {
                totalModules: modules.length,
                completedModules,
                progressPercentage: modules.length > 0 ? (completedModules / modules.length) * 100 : 0
              }
            };
          } catch (error) {
            this.logger.error("Failed to get basic progress for course", {
              courseId: course._id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });

            return {
              ...course,
              progress: {
                totalModules: 0,
                completedModules: 0,
                progressPercentage: 0
              }
            };
          }
        })
      );

      this.logger.info("Successfully retrieved basic course info for user", {
        userId,
        courseCount: coursesWithBasicProgress.length
      });

      return coursesWithBasicProgress;
    }, {
      service: "CourseService",
      method: "getUserCoursesBasic"
    });
  }

  public async getTemplates(opts: { userId?: string }) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting templates", { userId: opts.userId });

      const templates = await this.courseRepository.list({
        isSystemGenerated: true,
      });

      if (!templates || templates.length === 0) {
        this.logger.info("No system generated templates found");
        return [];
      }

      let availableTemplates = templates;

      if (opts.userId) {
        const userTemplates = await this.courseRepository.list({
          createdBy: opts.userId,
          isFromTemplate: true,
        });

        const userLearningTemplateIds = new Set(
          userTemplates
            .filter(userTemplate => userTemplate.templateId)
            .map(userTemplate => userTemplate.templateId)
        );

        availableTemplates = templates.filter(
          template => !userLearningTemplateIds.has(template._id)
        );

        this.logger.info("Filtered templates for user", {
          userId: opts.userId,
          totalTemplates: templates.length,
          userLearningCount: userLearningTemplateIds.size,
          availableCount: availableTemplates.length,
          filteredTemplateIds: Array.from(userLearningTemplateIds)
        });
      } else {
        this.logger.info("Returning all templates (no user filter)", {
          totalTemplates: templates.length
        });
      }

      const templatesWithProgress = availableTemplates.map(template => ({
        ...template,
        progress: {
          totalModules: template.moduleIds?.length || 0,
          completedModules: 0,
          progressPercentage: 0
        }
      }));

      this.logger.info("Successfully retrieved templates", {
        userId: opts.userId,
        returnedCount: templatesWithProgress.length
      });

      return templatesWithProgress;
    }, {
      service: "CourseService",
      method: "getTemplates"
    });
  }
}

