import { getDefaultCourseService } from "@/config/defaults";
import dbConnect from "@/config/mongodb.config";
import { validateBody } from "@/lib/bodyValidator";
import { courseGenerationRequestSchema } from "@/lib/schemas/request";
import { apiErrorHandler, responseCreator } from "@/lib/utils/apiResponse.utils";
import { ErrorResponse, NewCourse } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return responseCreator(401, false, "Unauthorized", {});
    }
    await dbConnect();
    const courseService = getDefaultCourseService();
    const { userQuery } = await validateBody(courseGenerationRequestSchema, req);
    const data: NewCourse = {
      userId,
      isPrivate: true,
      isSystemGenerated: false,
      prompt: userQuery,
      isEnhanced: true,
    }
    const res = await courseService.createCourse(data);
    return responseCreator(200, true, "Course generated successfully", { id: res.course._id });
  } catch (error) {
    return apiErrorHandler(error as ErrorResponse)
  }
}
