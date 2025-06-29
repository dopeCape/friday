import { z } from "zod";

export const videoScriptGenerationShcmea = z.object({
  scripts: z.array(z.string()).describe("Script chuncked per slide"),
  title: z.string().describe("Title for video"),
}) 
