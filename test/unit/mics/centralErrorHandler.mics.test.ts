import { vi, describe, beforeEach, test, expect } from 'vitest';
import { CentralErrorHandler } from '@/lib/errorHandler/centralErrorHandler';
import { ErrorHandlerContext, IErrorHandler } from '@/types';
import { Logger } from "@/lib/services/logger.service"

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

describe('CentralErrorHandler', () => {
  let centralErrorHandler: CentralErrorHandler;

  beforeEach(() => {
    const logger = Logger.getInstance()
    centralErrorHandler = new CentralErrorHandler(logger);
    vi.clearAllMocks();
  });

  test('registerHandler adds and sorts handlers by priority', () => {
    const highPriorityHandler = createMockHandler('HighPriority', 1);
    const lowPriorityHandler = createMockHandler('LowPriority', 10);

    centralErrorHandler.registerHandler(lowPriorityHandler);
    centralErrorHandler.registerHandler(highPriorityHandler);

    expect((centralErrorHandler as any).handlers[0]).toBe(highPriorityHandler);
    expect((centralErrorHandler as any).handlers[1]).toBe(lowPriorityHandler);
  });

  test('uses fallback handler when no custom handlers can handle the error', async () => {
    const fallbackSpy = vi.spyOn((centralErrorHandler as any).fallbackHandler, 'handle');

    try {
      await centralErrorHandler.handleError(async () => {
        throw new Error('Test error');
      });
    } catch (error: any) {
      expect(fallbackSpy).toHaveBeenCalled();
      expect(error).toMatchObject({
        statusCode: 500,
        message: 'Internal server error',
        errorCode: 'INTERNAL_ERROR'
      });
    }
  });

  test('selects appropriate handler based on error type', async () => {
    class CustomError extends Error {
      name = 'CustomError';
    }

    const customHandler = createMockHandler('CustomHandler', 5, ['CustomError']);
    centralErrorHandler.registerHandler(customHandler);

    try {
      await centralErrorHandler.handleError(async () => {
        throw new CustomError('Custom test error');
      });
    } catch (error) {
      expect(customHandler.handle).toHaveBeenCalled();
    }
  });

  test('passes through pre-formatted errors', async () => {
    const formattedError = {
      errorCode: 'FORMATTED',
      statusCode: 400,
      message: 'Already formatted'
    };

    try {
      await centralErrorHandler.handleError(async () => {
        throw formattedError;
      });
    } catch (error) {
      expect(error).toEqual(formattedError);
    }
  });

});

function createMockHandler(name: string, priority: number, allowedErrors: string[] = []): IErrorHandler {
  return {
    name,
    priority,
    canHandle: vi.fn((error: Error) =>
      allowedErrors.length === 0 || allowedErrors.includes(error.name)
    ),
    handle: vi.fn((error: Error, context: ErrorHandlerContext) => ({
      statusCode: 400,
      message: `Handled by ${name}`,
      errorCode: `${name}_ERROR`,
      metadata: context.metadata
    }))
  };
}
