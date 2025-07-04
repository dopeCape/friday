import { z } from "zod"
const userLevelSchema = z.enum(["beginner", "intermediate", "expert"])
const userOsSchema = z.enum(["windows", "mac", "linux"])

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  _id: z.string(),
  clerkId: z.string(),
  profileImage: z.string(),
  stats: z.object({
    level: userLevelSchema,
    stack: z.array(z.string()),
    os: userOsSchema,
    knowsBasicCommands: z.boolean(),
    knowsGit: z.boolean(),
  }).optional(),
});


export { userSchema, userOsSchema, userLevelSchema }
