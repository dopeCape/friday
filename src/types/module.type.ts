import { moduleContentSchema, moduleSchema } from "@/lib/schemas";
import { z } from "zod";
type Module = z.infer<typeof moduleSchema>
type ModuleGenerationData = {
  title: string,
  description: string,
  topicsToCover: string
}

type GeneratedModuleData = z.infer<typeof moduleContentSchema>

export type { Module, ModuleGenerationData, GeneratedModuleData }



