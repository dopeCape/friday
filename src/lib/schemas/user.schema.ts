import { z } from "zod"
const userLevelSchema = z.enum(["bignner", "intermediate", "expert"])
const userOsSchema = z.enum(["windows", "mac", "linux"])

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  id: z.string(),
  profileImage: z.string(),
  stats: z.object({
    level: userLevelSchema,
    stack: z.array(z.string()),
    os: userOsSchema,
    knowsBasicCommands: z.boolean(),
  }),
});


export { userSchema, userOsSchema, userLevelSchema }
