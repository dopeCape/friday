import {
  ErrorHandlerContext,
  ErrorMetadata,
  ErrorResponse,
  IErrorHandler,
} from "@/types";
import { BaseErrorHandler } from "./baseErrorHandler";
import { Logger } from "@/types"

/**
 * Central error handling coordinator that manages multiple error handlers
 * @description Orchestrates error handling across the application by delegating
 * errors to appropriate handlers based on priority and error type
 */
export class CentralErrorHandler {
  /**
   * Collection of registered error handlers
   * @private
   */
  private handlers: IErrorHandler[] = [];

  /**
   * Fallback handler for unhandled errors
   * @private
   */
  private fallbackHandler: IErrorHandler;

  /**
   * Logger instance for error tracking
   * @private
   */
  private logger: Logger;

  /**
   * Default error response when all handlers fail
   * @private
   */
  private fallbackError: ErrorResponse = {
    message: "Critical bug in Error handler",
    errorCode: "fallBackErrorUsed",
    statusCode: 500,
  };

  /**
   * Initializes the CentralErrorHandler with a default fallback handler
   * @description Creates an anonymous handler that catches all unhandled errors
   */
  constructor(logger: Logger) {
    this.logger = logger;
    this.fallbackHandler = new (class extends BaseErrorHandler {
      name = "FallbackHandler";
      priority = Infinity;
      allowedErrors: string[] = [];
      canHandle = () => true;
      handle(error: Error, context: ErrorHandlerContext): ErrorResponse {
        context.logger.error("Unhandled error", {
          error: {
            name: error.name,
            stack: error.stack,
            message: error.message,
          },
          metadata: context.metadata,
        });
        return {
          statusCode: 500,
          message: "Internal server error",
          errorCode: "INTERNAL_ERROR",
          metadata: context.metadata,
        };
      }
    })();
  }

  /**
   * Registers a single error handler
   * @param handler - Error handler to register
   * @description Adds handler and sorts all handlers by priority
   * @example
   * const authHandler = new AuthErrorHandler();
   * centralErrorHandler.registerHandler(authHandler);
   */
  registerHandler(handler: IErrorHandler): void {
    this.handlers.push(handler);
    this.handlers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Registers multiple error handlers at once
   * @param handlers - Array of error handlers to register
   * @example
   * const handlers = [
   *   new AuthErrorHandler(),
   *   new DatabaseErrorHandler(),
   *   new ValidationErrorHandler()
   * ];
   * centralErrorHandler.registerHandlers(handlers);
   */
  registerHandlers(handlers: IErrorHandler[]): void {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  /**
   * Processes an error through the chain of handlers
   * @private
   * @param error - Error to be processed
   * @param metadata - Optional metadata to include in error response
   * @returns Promise resolving to formatted error response
   * @description Attempts to handle error with registered handlers in priority order,
   * falling back to default handler if no other handler can process the error
   */
  private async processError(
    error: Error,
    metadata?: ErrorMetadata,
  ): Promise<ErrorResponse> {
    // If error is already formatted, return as is
    if ("errorCode" in error && "statusCode" in error) {
      return { ...error } as ErrorResponse;
    }

    const context: ErrorHandlerContext = {
      logger: this.logger,
      metadata: {
        timestamp: new Date(),
        ...metadata,
      },
    };

    // Try each handler in priority order
    for (const handler of this.handlers) {
      const canHandle = handler.canHandle(error);
      if (canHandle) {
        const response = handler.handle(error, context);
        if (response) return response;
      }
    }

    // Use fallback handler if no other handler succeeded
    return this.fallbackHandler.handle(error, context) || this.fallbackError;
  }

  /**
   * Main error handling method that wraps async operations
   * @param operation - Async operation to execute
   * @param metadata - Optional metadata to include in error response
   * @param session - Optional MongoDB session for transaction handling
   * @returns Promise resolving to operation result or throwing formatted error
   * @example
   * try {
   *   const result = await centralErrorHandler.handleError(
   *     async () => await someAsyncOperation(),
   *     { requestId: "123" },
   *     mongoSession
   *   );
   *   return result;
   * } catch (error) {
   *   // Error will be properly formatted
   *   console.error(error);
   * }
   */
  async handleError<T>(
    operation: () => Promise<T>,
    metadata?: ErrorMetadata,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const processedError = await this.processError(error as Error, metadata);
      throw processedError;
    }
  }
}
