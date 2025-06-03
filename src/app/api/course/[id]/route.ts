import { getDefaultCourseService } from "@/config/defaults"
import dbConnect from "@/config/mongodb.config";
import { AppError } from "@/lib/errorHandler/appError";
import { apiErrorHandler, responseCreator } from "@/lib/utils/apiResponse.utils";
import { ErrorResponse } from "@/types";

export async function GET(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params
    const courseService = getDefaultCourseService();
    const { course, modules, chapters } = await courseService.getCourseWithContent(id);
    return responseCreator(200, true, "Found course with content", { course, modules, chapters })
  } catch (error) {
    return apiErrorHandler(error as ErrorResponse)
  }
}
