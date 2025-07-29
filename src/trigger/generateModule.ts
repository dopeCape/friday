import { getDefaultCourseRepository, getDefaultModuleService } from "@/config/defaults";
import dbConnect from "@/config/mongodb.config";
import { task } from "@trigger.dev/sdk/v3";
type Payload = {
  moduleId: string,
  courseId: string

}

export const generateModuleChapters = task({
  id: "generate-module",
  maxDuration: 480,
  retry: {
    maxAttempts: 1
  },
  machine: "large-1x",

  run: async ({ moduleId, courseId }: Payload) => {
    await dbConnect()
    const moduleService = getDefaultModuleService();
    const courseRepository = getDefaultCourseRepository();
    const courseData = await courseRepository.get({ _id: courseId });
    if (!courseData) {
      throw new Error("Course not found");
    }
    await moduleService.generateModuleChapters(moduleId);
    const currentIndex = courseData.moduleIds.indexOf(moduleId);
    const nextIndex = currentIndex + 1;
    if (nextIndex < courseData.moduleIds.length) {
      await generateModuleChapters.trigger({ moduleId: courseData.moduleIds[nextIndex], courseId: courseData._id })
    }
  },
},
);
