import { getDefaultCourseService } from "@/config/defaults";
import dbConnect from "@/config/mongodb.config";
import { apiErrorHandler, responseCreator } from "@/lib/utils/apiResponse.utils";
import { ErrorResponse } from "@/types";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    await dbConnect();

    const courseService = getDefaultCourseService();

    const opts: { userId?: string } = {};
    if (userId) {
      opts.userId = userId;
    }

    const templates = await courseService.getTemplates(opts);
    return responseCreator(200, true, "Templates fetched successfully", templates);

  } catch (error) {
    return apiErrorHandler(error as ErrorResponse)

  }
}
