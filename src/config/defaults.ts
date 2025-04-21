import { OpenAIErrorHandler } from "@/lib/errorHandler/openaiErrorHandler";
import { ChapterRepository } from "@/lib/repository/mongoose/chapter.mongoose.repository";
import CourseRepository from "@/lib/repository/mongoose/course.mongoose.repository";
import { ModuleRepository } from "@/lib/repository/mongoose/module.mongoose.repository";
import { QuizRepository } from "@/lib/repository/mongoose/quiz.mongoose.repository";
import UserRepository from "@/lib/repository/mongoose/user.mongoose.repository";
import ChapterService from "@/lib/services/chapter.service";
import CourseService from "@/lib/services/course.service";
import EmbeddingService from "@/lib/services/embedding.service";
import LLMService from "@/lib/services/llm.service";
import { Logger } from "@/lib/services/logger.service";
import ModuleService from "@/lib/services/module.service";
import QuizService from "@/lib/services/quiz.service";
import SearchService from "@/lib/services/serarch.service";
import UserService from "@/lib/services/user.service";
import VectorDbService from "@/lib/services/vectorDb.service";


export function getDefaultLogger() {
  const logger = Logger.getInstance();
  return logger;
}

export function getDefaultUserService() {
  const logger = getDefaultLogger();
  const userRepository = UserRepository.getInstance(logger);
  return UserService.getInstance(logger, userRepository);
}

export function getDefaultCourseRepository() {
  const logger = getDefaultLogger();
  return CourseRepository.getInstance(logger)
}
export function getDefaultModuleRepository() {
  const logger = getDefaultLogger();
  return ModuleRepository.getInstance(logger);
}
export function getDefaultModuleService() {
  const moduleRepository = getDefaultModuleRepository();
  const logger = getDefaultLogger();
  return ModuleService.getInstance(logger, moduleRepository);
}
export function getDefaultLLMService() {
  const logger = getDefaultLogger();
  const openAiErrorHandler = new OpenAIErrorHandler()
  return LLMService.getInstance(logger, openAiErrorHandler);
}
export function getDefaultQuizRepository() {
  const logger = getDefaultLogger();
  return QuizRepository.getInstance(logger);

}

export function getDefaultQuizService() {
  const logger = getDefaultLogger()
  const quizRepository = getDefaultQuizRepository()
  return QuizService.getInstance(logger, quizRepository)
}
export function getDefaultChapterRepository() {
  const logger = getDefaultLogger()
  return ChapterRepository.getInstance(logger);
}
export function getDefaultChapterService() {
  const logger = getDefaultLogger()
  const chapterRepository = getDefaultChapterRepository();
  return ChapterService.getInstance(logger, chapterRepository)
}

export function getDefaultSearchService() {
  const logger = getDefaultLogger()
  return SearchService.getInstance(logger)
}
export function getDefaultEmbeddingsService() {
  const logger = getDefaultLogger()
  return EmbeddingService.getInstance(logger);
}
export function getDefaultVectorDbService() {
  const logger = getDefaultLogger()
  const embeddignService = getDefaultEmbeddingsService();
  return VectorDbService.getInstance(logger, embeddignService);
}

export function getDefaultCourseService() {
  const logger = getDefaultLogger();
  const courseRepository = getDefaultCourseRepository()
  const moduleService = getDefaultModuleService();
  const llmService = getDefaultLLMService();
  const quizService = getDefaultQuizService();
  const chapterService = getDefaultChapterService();
  const vectorDbService = getDefaultVectorDbService();
  return CourseService.getInstance(logger, courseRepository, moduleService, quizService, chapterService, llmService, vectorDbService);
}
