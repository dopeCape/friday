import { moduleSchema } from "@/lib/schemas";
import { z } from "zod";
type Module = z.infer<typeof moduleSchema>
export type { Module }



