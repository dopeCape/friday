import { getDefaultCourseService } from "@/config/defaults";
import dbConnect from "@/config/mongodb.config";
import { apiErrorHandler, responseCreator } from "@/lib/utils/apiResponse.utils";
import { ErrorResponse } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return responseCreator(401, false, "Unauthorized", {});
    }

    await dbConnect();
    const courseService = getDefaultCourseService();

    // Get query parameters for different response types
    const { searchParams } = new URL(req.url);
    const includeContent = searchParams.get('includeContent') === 'true';
    const limit = searchParams.get('limit');
    const includeCompleted = searchParams.get('includeCompleted');
    const includeLocked = searchParams.get('includeLocked');

    let coursesData;

    if (includeContent) {
      coursesData = await courseService.getUserCourses(userId);
    } else {
      coursesData = await courseService.getUserCoursesBasic(userId);
    }

    if (includeCompleted === 'false') {
      coursesData = coursesData.filter(courseData => {
        if ('progress' in courseData && typeof courseData.progress === 'object' && 'moduleProgress' in courseData.progress) {
          return courseData.progress.moduleProgress < 100;
        }
        if ('progress' in courseData && typeof courseData.progress === 'object' && 'progressPercentage' in courseData.progress) {
          return courseData.progress.progressPercentage < 100;
        }
        return true;
      });
    }

    if (limit && !isNaN(parseInt(limit))) {
      coursesData = coursesData.slice(0, parseInt(limit));
    }

    const totalCourses = coursesData.length;
    let totalModules = 0;
    let completedModules = 0;
    let totalChapters = 0;
    let completedChapters = 0;

    coursesData.forEach(courseData => {
      if ('modules' in courseData) {
        totalModules += courseData.modules.length;
        completedModules += courseData.modules.filter(m => m.isCompleted).length;
      }
      if ('chapters' in courseData) {
        totalChapters += courseData.chapters.length;
        completedChapters += courseData.chapters.filter(c => c.isCompleted).length;
      }
      if ('progress' in courseData && typeof courseData.progress === 'object') {
        if ('totalModules' in courseData.progress) {
          totalModules += courseData.progress.totalModules;
          completedModules += courseData.progress.completedModules;
        }
      }
    });

    const summary = {
      totalCourses,
      totalModules,
      completedModules,
      totalChapters,
      completedChapters,
      overallProgress: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
    };

    return responseCreator(200, true, "Courses retrieved successfully", {
      courses: coursesData,
      summary,
      meta: {
        includeContent,
        limit: limit ? parseInt(limit) : null,
        filters: {
          includeCompleted: includeCompleted !== 'false',
          includeLocked: includeLocked !== 'false'
        }
      }
    });

  } catch (error) {
    return apiErrorHandler(error as ErrorResponse);
  }
}


