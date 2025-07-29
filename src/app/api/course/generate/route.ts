import { getDefaultCourseService } from "@/config/defaults";
import dbConnect from "@/config/mongodb.config";
import type { generateCourse } from "@/trigger/generateCourse";
import { tasks } from "@trigger.dev/sdk/v3";
import { validateBody } from "@/lib/bodyValidator";
import { courseGenerationRequestSchema } from "@/lib/schemas/request";
import { apiErrorHandler, responseCreator } from "@/lib/utils/apiResponse.utils";
import { ErrorResponse, NewCourse } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { v4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return responseCreator(401, false, "Unauthorized", {});
    }
    const generationId = v4()
    await dbConnect();
    const { userQuery } = await validateBody(courseGenerationRequestSchema, req);
    const data: NewCourse & { generationId: string } = {
      userId,
      isPrivate: true,
      isSystemGenerated: false,
      prompt: userQuery,
      isEnhanced: true,
      generationId
    }
    await tasks.trigger<typeof generateCourse>("generate-course", data);
    return responseCreator(200, true, "Course generated successfully", { id: generationId });
  } catch (error) {
    return apiErrorHandler(error as ErrorResponse)
  }
}
