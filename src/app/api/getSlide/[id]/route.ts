import { getDefaultLogger, getDefaultRedisService } from "@/config/defaults";
import { apiErrorHandler, responseCreator } from "@/lib/utils/apiResponse.utils";
import { ErrorResponse } from "@/types";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const logger = getDefaultLogger();
    const redisService = getDefaultRedisService();
    logger.info("Getting slide data ", {
      id,
    })
    let attempts = 0;
    while (attempts < 3) {
      const slideData = await redisService.get(id);
      if (!slideData) {
        logger.warn("Slide data not found in redis")
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
        continue;
      }
      logger.info("Got slide data", {
        slideData,
      })
      const slideJSON = await JSON.parse(slideData);
      return responseCreator(200, true, "Found slide data", slideJSON);
    }
    return responseCreator(500, false, "Slide data not found", {});
  } catch (error) {
    apiErrorHandler(error as ErrorResponse);
  }
}

