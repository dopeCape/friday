import { OpenAIErrorHandler } from "@/lib/errorHandler/openaiErrorHandler";
import IconsProvider from "@/lib/providers/icons.provider";
import MemeProvider from "@/lib/providers/meme.provider";
import { ChapterRepository } from "@/lib/repository/mongoose/chapter.mongoose.repository";
import CourseRepository from "@/lib/repository/mongoose/course.mongoose.repository";
import { ModuleRepository } from "@/lib/repository/mongoose/module.mongoose.repository";
import { QuizRepository } from "@/lib/repository/mongoose/quiz.mongoose.repository";
import UserRepository from "@/lib/repository/mongoose/user.mongoose.repository";
import BlobService from "@/lib/services/blob.service";
import ChapterService from "@/lib/services/chapter.service";
import CourseService from "@/lib/services/course.service";
import EmbeddingService from "@/lib/services/embedding.service";
import FFMPEGService from "@/lib/services/ffmpeg.service";
import FileService from "@/lib/services/file.service";
import LLMService from "@/lib/services/llm.service";
import { Logger } from "@/lib/services/logger.service";
import ModuleService from "@/lib/services/module.service";
import QuizService from "@/lib/services/quiz.service";
import RealtimeService from "@/lib/services/realtime.service";
import RedisService from "@/lib/services/redis.service";
import ScreenshotService from "@/lib/services/screenshot.service";
import SearchService from "@/lib/services/serarch.service";
import TTSService from "@/lib/services/tts.service";
import UserService from "@/lib/services/user.service";
import VectorDbService from "@/lib/services/vectorDb.service";
import VideoService from "@/lib/services/video.service";


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
  const llmService = getDefaultLLMService();
  const iconProvider = getDefaultIconsProvider()
  const serarchService = getDefaultSearchService()
  return ModuleService.getInstance(logger, moduleRepository, llmService, iconProvider, serarchService, getDefaultQuizService(), getDefaultChapterService());
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
  const llmService = getDefaultLLMService();
  const courseRepository = getDefaultCourseRepository();
  const moduleRepository = getDefaultModuleRepository();
  const videoService = getDefaultVideoService();
  const realtimeService = getDefaultRealtimeService()
  const searchService = getDefaultSearchService()
  return ChapterService.getInstance(logger, chapterRepository, llmService, moduleRepository, courseRepository, videoService, realtimeService, searchService);
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
export function getDefaultIconsProvider() {
  const logger = getDefaultLogger();
  const vectorDbService = getDefaultVectorDbService()
  return IconsProvider.getInstance(logger, vectorDbService,);
}
export function getDefaultMemeProvider() {
  const logger = getDefaultLogger();
  const vectorDbService = getDefaultVectorDbService()
  return MemeProvider.getInstance(logger, vectorDbService);
}

export function getDefaultCourseService() {
  const logger = getDefaultLogger();
  const courseRepository = getDefaultCourseRepository()
  const moduleService = getDefaultModuleService();
  const llmService = getDefaultLLMService();
  const iconsProvider = getDefaultIconsProvider();
  const userService = getDefaultUserService()
  const chapterService = getDefaultChapterService()
  const realtimeServie = getDefaultRealtimeService();
  return CourseService.getInstance(logger, courseRepository, moduleService, llmService, iconsProvider, userService, chapterService, realtimeServie);
}
export function getDefaultFileService() {
  const logger = getDefaultLogger();
  const fileService = FileService.getInstance(logger);
  return fileService;
}
export function getDefaultTTSService() {
  const logger = getDefaultLogger();
  const fileService = getDefaultFileService();
  return TTSService.getInstance(logger, fileService);
}

export function getDefaultVideoService() {
  const logger = getDefaultLogger();
  const llmService = getDefaultLLMService();
  const vectorDbService = getDefaultVectorDbService();
  const ttsService = getDefaultTTSService()
  const redisService = getDefaultRedisService();
  const screenShotService = getDefaultScreenshotService();
  const ffmpegService = getDefaultFFMPEGService();
  const memeProvider = getDefaultMemeProvider()
  const blobService = getDefaultBlobService();
  const fileService = getDefaultFileService();
  return VideoService.getInstance(
    logger,
    vectorDbService,
    llmService,
    ttsService,
    redisService,
    screenShotService,
    ffmpegService,
    memeProvider,
    blobService,
    fileService
  );
}

export function getDefaultScreenshotService() {
  const logger = getDefaultLogger();
  const fileService = getDefaultFileService();
  const screenShotService = ScreenshotService.getInstance(logger, fileService);
  return screenShotService

}

export function getDefaultFFMPEGService() {
  const logger = getDefaultLogger();
  const ffmpegService = FFMPEGService.getInstance(logger);
  return ffmpegService;
}

export function getDefaultBlobService() {
  const logger = getDefaultLogger()
  return BlobService.getInstance(logger)
}

export function getDefaultRedisService() {
  const logger = getDefaultLogger();
  return RedisService.getInstance(logger);
}
export function getDefaultRealtimeService() {
  const logger = getDefaultLogger();
  return RealtimeService.getInstace(logger);
} 
