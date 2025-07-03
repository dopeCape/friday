import { getDefaultCourseService, getDefaultFFMPEGService, getDefaultFileService, getDefaultLLMService, getDefaultLogger, getDefaultMemeProvider, getDefaultScreenshotService, getDefaultSearchService, getDefaultVideoService } from "@/config/defaults";
import env from "@/config/env.config";
import dbConnect from "@/config/mongodb.config";
import { NewCourse } from "@/types";
import { TavilySearch } from "@langchain/tavily";
import { NextResponse } from "next/server";
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

export async function GET(req: Request) {
  const vs = getDefaultVideoService();
  const path = await vs.generateVideo("Binary Search Trees Fundamentals - explain the data structure, show how nodes are organized, demonstrate the search process, and cover key operations like insert and find", { lang: "rust" });
  return NextResponse.json(path);
}
