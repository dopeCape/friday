import { getDefaultChapterService, getDefaultCourseService } from "@/config/defaults"
import dbConnect from "@/config/mongodb.config";
import { z } from "zod";
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


const handleNextRequestSchema = z.object({
  chapterId: z.string().min(1, "Chapter ID is required"),
  moduleId: z.string().min(1, "Module ID is required"),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id: courseId } = await params;
    const body = await request.json();
    const validatedBody = handleNextRequestSchema.parse(body);
    const { chapterId, moduleId } = validatedBody;
    const chapterService = getDefaultChapterService();
    const result = await chapterService.handleNext(chapterId, moduleId, courseId);

    return responseCreator(
      200,
      true,
      "Successfully moved to next chapter",
      {
        nextChapterId: result?.nextChapterId || null,
        nextModuleId: result?.nextModuleId || null,
        courseCompleted: result?.courseCompleted || false,
        chapterId,
        moduleId,
        courseId
      }
    );

  } catch (error) {
    return apiErrorHandler(error as ErrorResponse);
  }
}
