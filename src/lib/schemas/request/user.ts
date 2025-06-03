import { z } from "zod";
import { userLevelSchema, userOsSchema } from "../user.schema";

const userOnboardingSchema = z.object({
  stack: z.array(z.string()),
  level: userLevelSchema,
  os: userOsSchema,
  knowsBasicCommands: z.boolean(),
  knowsGit: z.boolean()
})


export { userOnboardingSchema };
