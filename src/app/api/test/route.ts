import { getDefaultCourseService, getDefaultFFMPEGService, getDefaultFileService, getDefaultLLMService, getDefaultLogger, getDefaultMemeProvider, getDefaultRealtimeService, getDefaultScreenshotService, getDefaultSearchService, getDefaultVideoService } from "@/config/defaults";
import env from "@/config/env.config";
import dbConnect from "@/config/mongodb.config";
import { PromptProvider } from "@/lib/providers/prompt.provider";
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
  const rs = getDefaultRealtimeService();
  const llmService = getDefaultLLMService();
  const data = await llmService.structuredResponse(PromptProvider.getSyntheticThinkingPrompt("I want to learn rust from start to end "), z.object({
    thinking: z.array(z.object({
      title: z.string().describe("Title of the block"),
      content: z.string().describe("Content of the block, in markdown format"),
    })
    )
  }), { provider: "openai", model: "gpt-4.1" })
  await rs.pushToClient("test", "THINKING_STREAM", data.parsed);
  return NextResponse.json({ message: "Success" });
};
