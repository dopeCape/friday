import { getDefaultCourseService } from "@/config/defaults";
import dbConnect from "@/config/mongodb.config";
import { NewCourse } from "@/types";
import { task } from "@trigger.dev/sdk/v3";
import { generateModuleChapters } from "./generateModule";


export const generateCourse = task({
  id: "generate-course",
  maxDuration: 480,
  retry: {
    maxAttempts: 1
  },
  run: async (courseGenerationData: NewCourse & { generationId: string }) => {
    await dbConnect()
    const courseService = getDefaultCourseService();
    const courseData = await courseService.createCourse(courseGenerationData);
    await generateModuleChapters.trigger({ moduleId: courseData.course.moduleIds[0], courseId: courseData.course._id })
  },
},
);
