import { getDefaultLogger } from "@/config/defaults";
import { ErrorResponse } from "@/types";
import env from "@/config/env.config";

export function apiErrorHandler(error: ErrorResponse) {
  const logger = getDefaultLogger();
  logger.error(error.message, {
    ...error.metadata,
    errorCode: error.errorCode,
    errorData: error.errorData,
  });
  return Response.json({
    message: error.metadata?.message,
    errorCode: error.errorCode,
    errorData: env.NODE_ENV === "development" ? error.errorData : undefined
  }, {
    status: error.statusCode,
  })
}
export function responseCreator(
  statusCode: number,
  success: boolean,
  message: string,
  data: any,
) {
  return Response.json({
    message, data, success
  }, { status: statusCode })
}
