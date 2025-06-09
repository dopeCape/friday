import { getDefaultCourseService, getDefaultLLMService, getDefaultSearchService } from "@/config/defaults";
import env from "@/config/env.config";
import dbConnect from "@/config/mongodb.config";
import { NewCourse } from "@/types";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";

// export async function GET(req: Request) {
//   await dbConnect()
//   const courseService = getDefaultCourseService();
//   const userQuery = "I want to learn rust from start to end"
//   const data: NewCourse = {
//     userId: "asdf",
//     isPrivate: true,
//     isSystemGenerated: false,
//     prompt: userQuery,
//     isEnhanced: true,
//   }
//   const res = await courseService.createCourse(data);
//   // const res = await courseService.createCourseFromTemplate("683789d37a8dcf8595e33059", "asdf")
//   return Response.json(res);
// }

// export async function GET(req: Request) {
//   const searchService = getDefaultSearchService()
//   const result = await searchService.search("learn Concurrency in go, articles")
//   return Response.json(result);
// }

