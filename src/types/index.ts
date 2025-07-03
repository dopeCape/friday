import { User, UserOs, UserLevel } from "./user.type"
import {
  EnvVarType,
  EnvVarValidationSchema,
  ValidatedEnv,
  ValidationError,
  ValidationSchema,
} from "@/types/env.type"
import {
  LogLevel,
  LoggerMethods,
  LogMetadata,
  LogInfo,
  ColoredInfo,
  RequestContext,
} from "./logger.type"
import {
  ErrorResponse,
  ErrorMetadata,
  ErrorHandlerContext,
  IErrorHandler
} from "./error.type"
import {
  Course,
  NewCourse,
  CourseGenreation,
  CourseData
} from "./course.type"
import { BaseRepository, UpdateOpts, MongooseUpdateOpts, Filter, Projection } from "@/types/signatures/baseRespository.signature"
import { UserRepository } from "@/types/signatures/userRepository.signature"
import { Logger } from "./signatures/logger.signature"
import {
  Module,
  ModuleGenerationData,
  GeneratedModuleData
} from "./module.type"
import {
  Chapter, Quiz, Question, AnswerType, ModuleContent, DifficultyLevel, Assignment
} from "./chapter.type"
import { WithoutId } from "./utils.type"
import { CourseRepository } from "./signatures/courseRepository.signature"
import { LLMProvider, LLMOpts, ConverstionType } from "./llm.type"
import { ModuleRepository } from "./signatures/moduleRepository.signature"
import { QuizRepository } from "./signatures/quizRepository.signature"
import { ChapterRepository } from "./signatures/chapterRepository.signature"
import { VideoOpts } from "./video.type"
import { TTSOpts } from "./tts.type";
type SessionClaims = {
  onboarded: boolean

}
export type {
  User, UserOs, UserLevel,
  EnvVarType,
  EnvVarValidationSchema,
  ValidatedEnv,
  ValidationError,
  ValidationSchema,
  LogLevel,
  LoggerMethods,
  LogMetadata,
  LogInfo,
  ColoredInfo,
  RequestContext,
  ErrorResponse,
  ErrorMetadata,
  ErrorHandlerContext,
  IErrorHandler,
  BaseRepository,
  UpdateOpts,
  MongooseUpdateOpts,
  Filter, Projection,
  Logger,
  UserRepository,
  Course,
  Module, Chapter, Quiz, Question, AnswerType, WithoutId, CourseRepository, NewCourse,
  LLMProvider, LLMOpts, ConverstionType,
  CourseGenreation,
  ModuleContent, DifficultyLevel, Assignment, ModuleRepository, QuizRepository, ChapterRepository, ModuleGenerationData, GeneratedModuleData,
  SessionClaims,
  CourseData,
  VideoOpts,
  TTSOpts
}

