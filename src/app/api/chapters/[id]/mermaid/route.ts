import { getDefaultChapterService } from "@/config/defaults";
import { validateBody } from "@/lib/bodyValidator";
import { apiErrorHandler, responseCreator } from "@/lib/utils/apiResponse.utils";
import { ErrorResponse } from "@/types";
import { NextRequest } from "next/server";
import { z } from "zod";
const schema = z.object({
  contentId: z.string(),
  content: z.string()
})

export async function PATCH(req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await validateBody(schema, req);
    const { id } = await params
    const chapterService = getDefaultChapterService();
    const chapter = await chapterService.updateMermaidContent(id, data.content, data.contentId);
    return responseCreator(200, true, "Chapter content updated", chapter);
  } catch (error) {
    return apiErrorHandler(error as ErrorResponse);
  }
}
