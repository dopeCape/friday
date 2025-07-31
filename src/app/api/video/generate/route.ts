import { getDefaultRedisService } from "@/config/defaults";
import dbConnect from "@/config/mongodb.config";
import type { generateVideo } from "@/trigger/generateVideo";
import { tasks } from "@trigger.dev/sdk/v3";
import { apiErrorHandler, responseCreator } from "@/lib/utils/apiResponse.utils";
import { ErrorResponse } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { v4 } from "uuid";
import { AppError } from "@/lib/errorHandler/appError";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return responseCreator(401, false, "Unauthorized", {});
    }

    const generationId = v4();

    await dbConnect();

    const { userQuery } = await req.json();
    if (!userQuery) {
      throw new AppError(400, "Video query is required", "INVALID_DATA");
    }

    const redisService = getDefaultRedisService();
    const videoCountKey = `video_generation_count:${userId}`;

    const currentCount = await redisService.get(videoCountKey) || 0;
    const countNumber = parseInt(currentCount.toString(), 10);

    if (countNumber >= 8) {
      throw new AppError(
        403,
        "Oops! You've reached your limit of 5 videos.",
        "RATE_LIMIT_EXCEEDED", {
        message: "Oops! You've reached your limit of 5 videos."
      }
      );
    }



    const newCount = countNumber + 1;
    await redisService.set(videoCountKey, newCount.toString());

    const data = {
      userQuery,
      generationId
    };

    await tasks.trigger<typeof generateVideo>("generate-video", data);

    return responseCreator(
      200,
      true,
      "Video generation started successfully",
      {
        id: generationId,
        remainingGenerations: 5 - newCount
      }
    );

  } catch (error) {
    return apiErrorHandler(error as ErrorResponse);
  }
}
