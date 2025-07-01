import { getDefaultCourseService, getDefaultFFMPEGService, getDefaultFileService, getDefaultLLMService, getDefaultMemeProvider, getDefaultScreenshotService, getDefaultSearchService, getDefaultVideoService } from "@/config/defaults";
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
  const fs = getDefaultFFMPEGService();
  const video = "/home/baby/workflow/projects/friday/temp/video/test1.mp4"
  const path = await fs.stitchVideos({
    videoPaths: [video, video, video],
    outputPath: "/home/baby/workflow/projects/friday/temp/video/stitched.mp4",
  })

  return NextResponse.json(path);
}

