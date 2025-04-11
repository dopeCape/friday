import { MongoErrorHandler } from "@/lib/errorHandler/mongooseErrorHandler";
import { vi, describe, beforeEach, test, expect } from 'vitest';
import { Logger } from "@/lib/services/logger.service"
import { getNewMongooseCaseError, getNewMongooseValidationError } from "../../fixture/data/error";
vi.mock('@/lib/services/logger.service', () => {
  const mockLogger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
  return {
    Logger: {
      getInstance: () => mockLogger
    }
  };
});

describe("MongooseErrorHandler", async () => {
  let mongoErrorHandler: MongoErrorHandler;
  let logger: Logger;
  beforeEach(() => {
    logger = Logger.getInstance()
    mongoErrorHandler = new MongoErrorHandler();
    vi.clearAllMocks();
  });

  test("Handles ValidationError errors", async () => {
    const errorSpy = vi.spyOn((logger as any), 'error');
    const validationHandlerSpy = vi.spyOn((mongoErrorHandler as any), 'handleValidationError');
    const error = mongoErrorHandler.handle(getNewMongooseValidationError(), { logger, metadata: { requestId: "123" } });
    expect(error?.statusCode).toBe(400);
    expect(error).toHaveProperty("message")
    expect(error?.errorCode).toBe("ValidationError")
    expect(error).toHaveProperty("metadata");
    expect(error).toHaveProperty("isOperational");
    expect(error).toHaveProperty("errorData");
    expect(error?.errorData).toHaveLength(2);
    expect(validationHandlerSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });

  test("Handles CastError errors", async () => {
    const castErrorHandlerSpy = vi.spyOn((mongoErrorHandler as any), 'handleCastError');
    const errorSpy = vi.spyOn((logger as any), 'error');
    const error = mongoErrorHandler.handle(getNewMongooseCaseError(), { logger, metadata: { requestId: "123" } });
    expect(error?.statusCode).toBe(400);
    expect(error).toHaveProperty("message")
    expect(error?.errorCode).toBe("CastError")
    expect(error).toHaveProperty("metadata");
    expect(error).toHaveProperty("isOperational");
    expect(error).toHaveProperty("errorData");
    expect(error?.errorData).toHaveLength(1);
    expect(castErrorHandlerSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

  });
  test("Returns null for unhandled error types", async () => {
    const unknownError = new Error("Unknown error");

    const errorSpy = vi.spyOn((logger as any), 'error');
    unknownError.name = "UnknownError";

    const error = mongoErrorHandler.handle(unknownError, { logger, metadata: { requestId: "123" } });
    expect(error).toBeNull();

    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("canHandle correctly identifies supported error types", () => {
    const validationError = getNewMongooseValidationError();
    const castError = getNewMongooseCaseError();
    const unknownError = new Error("Unknown");

    expect(mongoErrorHandler.canHandle(validationError)).toBe(true);
    expect(mongoErrorHandler.canHandle(castError)).toBe(true);
    expect(mongoErrorHandler.canHandle(unknownError)).toBe(false);
  });

  test("Constructor sets custom priority", () => {
    const customPriorityHandler = new MongoErrorHandler(5);
    expect(customPriorityHandler.priority).toBe(5);
  });

  test("Validation error response contains correct field information", () => {
    const validationError = getNewMongooseValidationError();

    const errorSpy = vi.spyOn((logger as any), 'error');
    const error = mongoErrorHandler.handle(validationError, { logger, metadata: { requestId: "123" } });

    const paths = error?.errorData?.map((item: any) => item.path);
    expect(paths).toContain('name');
    expect(paths).toContain('email');
    expect(errorSpy).toHaveBeenCalled();
  });

  test("Error response includes context metadata", () => {
    const metadata = { requestId: "123", userId: "456" };
    const error = mongoErrorHandler.handle(getNewMongooseCaseError(), { logger, metadata });
    expect(error?.metadata).toEqual(metadata);
  });

})

