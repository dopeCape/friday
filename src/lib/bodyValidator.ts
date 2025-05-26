import z, { ZodError } from "zod";
import { getDefaultLogger } from "@/config/defaults";
import { AppError } from "./errorHandler/appError";

export async function validateBody<T extends z.ZodSchema>(schema: T, request: Request) {
  const logger = getDefaultLogger();
  try {
    const body = await request.json();
    logger.info("Validating request body", { body: body });
    const parsedBody = await schema.parseAsync(body) as z.infer<T>;
    return parsedBody;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorData = error.issues.map((issue) => {
        return {
          path: issue.path,
          message: issue.message,
          code: issue.code,
        };
      });
      logger.error("Validation errror", { errorData });
      throw new AppError(400, "Bad Request", "ValidationError", { errorData });
    }
  }
};
