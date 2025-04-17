import { getDefaultCourseService } from "@/config/defaults";
import { NewCourse } from "@/types";

export async function GET(req: Request) {
  const courseService = getDefaultCourseService();
  const userQuery = "I want to learn mern stack from start to finish"
  const data: NewCourse = {
    userId: "",
    isPrivate: true,
    isSystemGenerated: true,
    prompt: userQuery,
    isEnhanced: true,
  }
  const res = await courseService.createCourse(data);
  return Response.json(res);
} 
