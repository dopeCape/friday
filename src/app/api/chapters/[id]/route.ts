import { NextRequest } from 'next/server';
import dbConnect from "@/config/mongodb.config";
import { getDefaultChapterService } from '@/config/defaults';
import { responseCreator } from '@/lib/utils/apiResponse.utils';
import { apiErrorHandler } from '@/lib/utils/apiResponse.utils';
import { ErrorResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const chapterService = getDefaultChapterService();
    const chapter = await chapterService.getChapterWithContent(id);
    return responseCreator(200, true, "Chapter content already generated", chapter);
  } catch (error) {
    console.error('Chapter generation error:', error);
    return apiErrorHandler(error as ErrorResponse);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const chapterService = getDefaultChapterService();
    const chapter = await chapterService.getChapter(id);
    if (!chapter) {
      return responseCreator(404, false, "Chapter not found", null);
    }
    const allowedUpdates = ['isCompleted'];
    const updateData: any = {};

    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return responseCreator(400, false, "No valid update fields provided", null);
    }
    const updatedChapter = await chapterService.updateChapter(id, updateData);
    return responseCreator(200, true, "Chapter updated successfully", {
      chapter: updatedChapter,
      updatedFields: Object.keys(updateData)
    });

  } catch (error) {
    console.error('Chapter update error:', error);
    return apiErrorHandler(error as ErrorResponse);
  }
}
