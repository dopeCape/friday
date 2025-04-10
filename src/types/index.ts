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
import { BaseRepository, UpdateOpts, MongooseUpdateOpts, Filter, Projection } from "@/types/signatures/baseRespository.signature"
import { Logger } from "./signatures/logger.signature"
// ==== barrel export====
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
  Logger
}
