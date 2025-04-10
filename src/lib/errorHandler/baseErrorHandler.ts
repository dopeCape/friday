import {
  ErrorHandlerContext,
  ErrorMetadata,
  ErrorResponse,
  IErrorHandler,
} from "@/types";

/**
 * Abstract base class for implementing error handlers
 * @implements IErrorHandler
 * @description Provides a foundation for creating specialized error handlers
 * with consistent error response formatting and common functionality
 */
export abstract class BaseErrorHandler implements IErrorHandler {
  /**
   * Unique identifier for the error handler
   * @abstract
   * @type {string}
   */
  abstract name: string;

  /**
   * Priority level for the error handler chain
   * @abstract
   * @type {number}
   * @description Determines the order in which error handlers are executed.
   * Lower numbers indicate higher priority.
   */
  abstract priority: number;

  /**
   * List of error types this handler can process
   * @abstract
   * @type {string[]}
   */
  abstract allowedErrors: string[];

  /**
   * Determines if this handler can process a given error
   * @abstract
   * @param error - The error to be checked
   * @returns {boolean} True if the handler can process the error
   */
  abstract canHandle(error: Error): boolean;

  /**
   * Processes an error and generates an appropriate error response
   * @abstract
   * @param error - The error to be handled
   * @param context - Context containing logger and additional metadata
   * @returns {ErrorResponse | null} Formatted error response or null if error cannot be handled
   */
  abstract handle(
    error: Error,
    context: ErrorHandlerContext,
  ): ErrorResponse | null;

  /**
   * Creates a standardized error response object
   * @protected
   * @param statusCode - HTTP status code for the error
   * @param message - Human-readable error message
   * @param errorCode - Application-specific error code
   * @param metadata - Additional error metadata
   * @param isOperational - Indicates if error is operational (default: true)
   * @param errorData - Optional additional error details
   * @returns {ErrorResponse} Formatted error response with timestamp
   * @example
   * protected handleDatabaseError(error: Error): ErrorResponse {
   *   return this.createErrorResponse(
   *     500,
   *     "Database connection failed",
   *     "DB_CONNECTION_ERROR",
   *     { requestId: "123" },
   *     true,
   *     { details: error.message }
   *   );
   * }
   *
   * // Response structure:
   * // {
   * //   statusCode: 500,
   * //   message: "Database connection failed",
   * //   errorCode: "DB_CONNECTION_ERROR",
   * //   isOperational: true,
   * //   errorData: { details: "..." },
   * //   metadata: {
   * //     requestId: "123",
   * //     timestamp: "2024-12-17T..."
   * //   }
   * // }
   */
  protected createErrorResponse(
    statusCode: number,
    message: string,
    errorCode: string,
    metadata?: ErrorMetadata,
    isOperational: boolean = true,
    errorData?: Record<string, any> | Record<string, any>[],
  ): ErrorResponse {
    return {
      statusCode,
      message,
      errorCode,
      isOperational,
      errorData,
      metadata: {
        timestamp: new Date(),
        ...metadata,
      },
    };
  }
}
