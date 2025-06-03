
import { getDefaultCourseService } from "@/config/defaults";
import dbConnect from "@/config/mongodb.config";
import { apiErrorHandler, responseCreator } from "@/lib/utils/apiResponse.utils";
import { ErrorResponse } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {

    const { userId } = await auth();


    if (!userId) {
      return responseCreator(401, false, "Unauthorized", {});

    }

    const body = await request.json();
    const { templateId } = body;

    if (!templateId) {
      return responseCreator(400, false, "Template ID is required", {});
    }
    await dbConnect()

    const courseService = getDefaultCourseService();
    const result = await courseService.createCourseFromTemplate(templateId, userId);

    return responseCreator(200, true, "Successfully enrolled in course", { id: result.course._id });

  } catch (error) {
    return apiErrorHandler(error as ErrorResponse)
  }
}
