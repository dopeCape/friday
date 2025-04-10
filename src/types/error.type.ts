import { Sevrity } from "./logger.type";
import { Logger } from "@/lib/services/logger.service";

export interface ErrorMetadata {
  service?: string;
  method?: string;
  sevrity?: Sevrity;
  [key: string]: any;
}

export interface ErrorHandlerContext {
  logger: Logger;
  metadata?: ErrorMetadata;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errorCode: string;
  metadata?: ErrorMetadata;
  isOperational?: boolean;
  errorData?: Record<string, any> | Record<string, any>[];
}

export interface IErrorHandler {
  name: string;
  priority: number;
  canHandle(error: Error): boolean;
  handle(error: Error, context: ErrorHandlerContext): ErrorResponse | null;
}
