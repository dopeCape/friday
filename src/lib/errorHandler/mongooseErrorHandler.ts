import { ErrorHandlerContext, ErrorResponse } from "@/types";
import { BaseErrorHandler } from "./baseErrorHandler";
import { Error } from "mongoose";

/**
 * Specialized error handler for MongoDB and Mongoose errors
 * @extends BaseErrorHandler
 * @description Handles MongoDB-specific errors including cast errors (type mismatches),
 * validation errors, and server errors. Transforms database-level errors into
 * API-friendly error responses.
 */
export class MongoErrorHandler extends BaseErrorHandler {
  /**
   * Name identifier for the error handler
   * @type {string}
   */
  name = "MongoErrorHandler";

  /**
   * Priority level for the error handler chain
   * @type {number}
   */
  priority = 1;

  /**
   * List of MongoDB error types this handler can process
   * @type {string[]}
   */
  allowedErrors: string[] = [
    "CastError",
    "ValidationError",
  ];

  /**
   * Creates an instance of MongoErrorHandler
   * @param priority - Optional priority level for the handler (default: 1)
   * @example
   * const handler = new MongoErrorHandler(2); // Create with custom priority
   */
  constructor(priority: number = 1) {
    super();
    this.priority = priority;
  }

  /**
   * Determines if this handler can process the given error
   * @param error - The MongoDB error to be checked
   * @returns {boolean} True if the error name matches any allowed MongoDB error types
   * @example
   * const handler = new MongoErrorHandler();
   * if (handler.canHandle(error)) {
   *   const response = handler.handle(error, context);
   * }
   */
  canHandle(error: Error): boolean {
    return this.allowedErrors.some((err) => err === error.name);
  }
  /**
   * Processes MongoDB errors and generates appropriate error responses
   * @param error - The MongoDB error to be handled
   * @param context - Context containing logger and additional metadata
   * @returns {ErrorResponse | null} Formatted error response or null if error not recognized
   * @description Routes different types of MongoDB errors to specialized handlers
   * TODO: Refactor to use switch statement for better readability
   * TODO: Enhance validation handling for more precise error responses
   * NOTE: Consider security implications of exposing MongoDB error details in API responses
   * @example
   * const response = handler.handle(error, {
   *   logger: Logger.getInstance(),
   *   metadata: { requestId: "123" }
   * });
   */
  handle(error: Error, context: ErrorHandlerContext): ErrorResponse | null {
    const { logger, metadata } = context;
    let errorResponse: ErrorResponse | null = null;
    let errorName = "";

    if (error instanceof Error.CastError) {
      errorResponse = this.handleCastError(error, context);
      errorName = "Cast error";
    }

    if (error instanceof Error.ValidationError) {
      errorResponse = this.handleValidationError(error, context);
      errorName = "Validation error";
    }

    console.log(metadata);
    if (errorResponse) {
      logger.error(errorName, {
        error: {
          name: error.name,
          stack: error.stack,
          message: error.message,
        },
        metadata: metadata,
      });
    }

    return errorResponse;
  }

  /**
   * Handles MongoDB cast errors (type mismatches)
   * @private
   * @param error - The cast error to be processed
   * @param context - Error handling context
   * @returns {ErrorResponse} Formatted error response with cast error details
   * @example
   * // Response structure for cast error:
   * // {
   * //   statusCode: 400,
   * //   message: "Invalid data",
   * //   errorCode: "CastError",
   * //   errorData: [{
   * //     path: "userId",
   * //     message: "Invalid value userId",
   * //     code: "Invalid type"
   * //   }],
   * //   metadata: { ... }
   * // }
   */
  private handleCastError(
    error: Error.CastError,
    context: ErrorHandlerContext,
  ): ErrorResponse {
    const { metadata } = context;
    let message = "Invalid data";
    return this.createErrorResponse(400, message, "CastError", metadata, true, [
      {
        path: error.path,
        message: `Invalid value ${error.path}`,
        code: "Invalid type",
      },
    ]);
  }

  /**
   * Handles MongoDB validation errors
   * @private
   * @param error - The validation error to be processed
   * @param context - Error handling context
   * @returns {ErrorResponse} Formatted error response with validation error details
   * @description Processes both simple validation errors and nested cast errors
   * within validation errors
   * @example
   * // Response structure for validation error:
   * // {
   * //   statusCode: 400,
   * //   message: "Invalid data",
   * //   errorCode: "ValidationError",
   * //   errorData: [{
   * //     path: "email",
   * //     message: "required",
   * //     code: "required"
   * //   }],
   * //   metadata: { ... }
   * // }
   */
  private handleValidationError(
    error: Error.ValidationError,
    context: ErrorHandlerContext,
  ) {
    const { metadata } = context;
    const errorData = Object.values(error.errors).map((err) => {
      if (err instanceof Error.CastError) {
        return {
          path: err.path,
          message: "Invalid value",
          code: "invalid_type",
        };
      }
      return {
        path: err.path,
        message: err.kind === "required" ? err.kind : "Invalid Value",
        code: err.kind === "required" ? err.kind : "invalid_type",
      };
    });

    return this.createErrorResponse(
      400,
      "Invalid data",
      "ValidationError",
      metadata,
      true,
      errorData,
    );
  }
}
