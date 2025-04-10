/**
 * Custom error class for application-specific errors
 * @extends Error
 * @description Provides a standardized way to create and handle application errors
 * with additional context like status codes and metadata
 */
export class AppError extends Error {
  /**
   * Creates an instance of AppError
   * @param statusCode - HTTP status code for the error
   * @param message - Human-readable error message
   * @param errorCode - Application-specific error code
   * @param metadata - Additional contextual information about the error
   * @param isOperational - Indicates if error is operational (default: true)
   *
   * @example
   * // Create a not found error
   * throw new AppError(
   *   404,
   *   "User not found",
   *   "USER_NOT_FOUND",
   *   { userId: "123" }
   * );
   *
   * // Create a validation error
   * throw new AppError(
   *   400,
   *   "Invalid input",
   *   "VALIDATION_ERROR",
   *   { field: "email" },
   *   true
   * );
   */
  constructor(
    public statusCode: number,
    public message: string,
    public errorCode: string,
    public metadata?: Record<string, any>,
    public isOperational: boolean = true,
  ) {
    super(message);

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);

    // Set error name
    this.name = this.constructor.name;
  }

  /**
   * Converts error instance to a plain object for serialization
   * @returns Object containing error details
   *
   * @example
   * const error = new AppError(404, "Not found", "NOT_FOUND");
   * const serialized = error.toJSON();
   * // {
   * //   errorCode: "NOT_FOUND",
   * //   message: "Not found",
   * //   statusCode: 404,
   * //   metadata: undefined,
   * //   isOperational: true
   * // }
   */
  toJSON() {
    return {
      errorCode: this.errorCode,
      message: this.message,
      statusCode: this.statusCode,
      metadata: this.metadata,
      isOperational: this.isOperational,
    };
  }
}
