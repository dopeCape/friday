import { ErrorHandlerContext, ErrorResponse } from "@/types";
import { BaseErrorHandler } from "./baseErrorHandler";

/**
 * Specialized error handler for OpenAI API errors
 * @extends BaseErrorHandler
 * @description Handles OpenAI API-specific errors including rate limits,
 * authentication failures, validation errors, and server errors. Transforms OpenAI error
 * responses into API-friendly error responses.
 */
export class OpenAIErrorHandler extends BaseErrorHandler {
  /**
   * Name identifier for the error handler
   * @type {string}
   */
  name = "OpenAIErrorHandler";

  /**
   * Priority level for the error handler chain
   * @type {number}
   */
  priority = 1;

  /**
   * List of OpenAI error types this handler can process
   * @type {string[]}
   */
  allowedErrors: string[] = [
    "RateLimitError",
    "AuthenticationError",
    "InvalidRequestError",
    "APIConnectionError",
    "APIError",
    "OpenAIError"
  ];

  /**
   * Creates an instance of OpenAIErrorHandler
   * @param priority - Optional priority level for the handler (default: 1)
   * @example
   * const handler = new OpenAIErrorHandler(2); // Create with custom priority
   */
  constructor(priority: number = 1) {
    super();
    this.priority = priority;
  }

  /**
   * Determines if this handler can process the given error
   * @param error - The OpenAI error to be checked
   * @returns {boolean} True if the error type matches any allowed OpenAI error types
   * @example
   * const handler = new OpenAIErrorHandler();
   * if (handler.canHandle(error)) {
   *   const response = handler.handle(error, context);
   * }
   */
  canHandle(error: any): boolean {
    // Check if it's an OpenAI error by name
    if (this.allowedErrors.includes(error.name)) {
      return true;
    }

    // Also check if it's an OpenAI error by structure
    if (error.status && error.error && typeof error.error === 'object') {
      return true;
    }

    return false;
  }

  /**
   * Processes OpenAI errors and generates appropriate error responses
   * @param error - The OpenAI error to be handled
   * @param context - Context containing logger and additional metadata
   * @returns {ErrorResponse | null} Formatted error response or null if error not recognized
   * @description Routes different types of OpenAI errors to specialized handlers
   * @example
   * const response = handler.handle(error, {
   *   logger: Logger.getInstance(),
   *   metadata: { requestId: "123" }
   * });
   */
  handle(error: any, context: ErrorHandlerContext): ErrorResponse | null {
    const { logger, metadata } = context;
    let errorResponse: ErrorResponse | null = null;

    // Handle based on error type
    switch (error.name) {
      case "RateLimitError":
        errorResponse = this.handleRateLimitError(error, context);
        break;
      case "AuthenticationError":
        errorResponse = this.handleAuthError(error, context);
        break;
      case "InvalidRequestError":
        errorResponse = this.handleInvalidRequestError(error, context);
        break;
      case "APIConnectionError":
        errorResponse = this.handleConnectionError(error, context);
        break;
      default:
        // Handle general OpenAI errors or errors with specific structure
        if (error.status && error.error) {
          errorResponse = this.handleGeneralOpenAIError(error, context);
        }
    }

    if (errorResponse) {
      logger.error(`OpenAI API error: ${error.name || 'Unknown'}`, {
        error: {
          name: error.name,
          stack: error.stack,
          message: error.message,
          status: error.status,
          code: error.code || (error.error && error.error.code),
          type: error.type || (error.error && error.error.type),
        },
        metadata: metadata,
      });
    }

    return errorResponse;
  }

  /**
   * Handles OpenAI rate limit errors
   * @private
   * @param error - The rate limit error to be processed
   * @param context - Error handling context
   * @returns {ErrorResponse} Formatted error response with rate limit details
   */
  private handleRateLimitError(
    error: any,
    context: ErrorHandlerContext
  ): ErrorResponse {
    const { metadata } = context;
    const message = "OpenAI API rate limit exceeded";

    return this.createErrorResponse(
      429,
      message,
      "RateLimitError",
      metadata,
      true,
      [{
        path: "request",
        message: error.message || "Too many requests",
        code: "rate_limit_exceeded"
      }]
    );
  }

  /**
   * Handles OpenAI authentication errors
   * @private
   * @param error - The authentication error to be processed
   * @param context - Error handling context
   * @returns {ErrorResponse} Formatted error response with authentication error details
   */
  private handleAuthError(
    error: any,
    context: ErrorHandlerContext
  ): ErrorResponse {
    const { metadata } = context;
    const message = "OpenAI API authentication failed";

    return this.createErrorResponse(
      401,
      message,
      "AuthenticationError",
      metadata,
      false,
      [{
        path: "authentication",
        message: error.message || "Invalid API key or token",
        code: "authentication_failed"
      }]
    );
  }

  /**
   * Handles OpenAI invalid request errors
   * @private
   * @param error - The invalid request error to be processed
   * @param context - Error handling context
   * @returns {ErrorResponse} Formatted error response with validation details
   */
  private handleInvalidRequestError(
    error: any,
    context: ErrorHandlerContext
  ): ErrorResponse {
    const { metadata } = context;
    const message = "Invalid OpenAI API request";

    // Parse param info from error message if available
    let path = "request";
    if (error.param) {
      path = error.param;
    } else if (error.message && error.message.includes(": ")) {
      const parts = error.message.split(": ");
      if (parts.length > 1) {
        path = parts[0].trim();
      }
    }

    return this.createErrorResponse(
      400,
      message,
      "InvalidRequestError",
      metadata,
      true,
      [{
        path: path,
        message: error.message || "Invalid request parameters",
        code: error.code || "invalid_request"
      }]
    );
  }

  /**
   * Handles OpenAI API connection errors
   * @private
   * @param error - The connection error to be processed
   * @param context - Error handling context
   * @returns {ErrorResponse} Formatted error response with connection error details
   */
  private handleConnectionError(
    error: any,
    context: ErrorHandlerContext
  ): ErrorResponse {
    const { metadata } = context;
    const message = "Failed to connect to OpenAI API";

    return this.createErrorResponse(
      503,
      message,
      "APIConnectionError",
      metadata,
      false,
      [{
        path: "connection",
        message: error.message || "Connection to OpenAI API failed",
        code: "connection_failed"
      }]
    );
  }

  /**
   * Handles general OpenAI API errors
   * @private
   * @param error - The OpenAI error to be processed
   * @param context - Error handling context
   * @returns {ErrorResponse} Formatted error response with error details
   */
  private handleGeneralOpenAIError(
    error: any,
    context: ErrorHandlerContext
  ): ErrorResponse {
    const { metadata } = context;
    const statusCode = error.status || 500;
    const message = "OpenAI API error occurred";

    // Extract meaningful information from the error object
    const errorInfo = error.error || {};
    const errorCode = errorInfo.code || errorInfo.type || "api_error";
    const errorMessage = errorInfo.message || error.message || "Unknown error";

    return this.createErrorResponse(
      statusCode,
      message,
      "OpenAIError",
      metadata,
      statusCode < 500, // Only client errors are retryable
      [{
        path: "api",
        message: errorMessage,
        code: errorCode
      }]
    );
  }
}
