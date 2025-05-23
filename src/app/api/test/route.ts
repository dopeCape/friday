import { getDefaultCourseService, getDefaultSearchService } from "@/config/defaults";
import env from "@/config/env.config";
import dbConnect from "@/config/mongodb.config";
import { NewCourse } from "@/types";
import { TavilySearch } from "@langchain/tavily";

export async function GET(req: Request) {
  await dbConnect()
  const courseService = getDefaultCourseService();
  const userQuery = "I want to learn golang from start to finish"
  const data: NewCourse = {
    userId: "asdf",
    isPrivate: true,
    isSystemGenerated: true,
    prompt: userQuery,
    isEnhanced: true,
  }
  const res = await courseService.createCourse(data);
  return Response.json(res);
}

// export async function GET(req: Request) {
//   const searchService = getDefaultSearchService()
//   const result = await searchService.search("learn Concurrency in go, articles")
//   return Response.json(result);
// }
