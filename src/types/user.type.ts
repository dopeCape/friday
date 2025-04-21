import { userSchema, userLevelSchema, userOsSchema } from "@/lib/schemas";
import z from "zod";

type User = z.infer<typeof userSchema>;
type UserLevel = z.infer<typeof userLevelSchema>;
type UserOs = z.infer<typeof userOsSchema>;

export type { User, UserOs, UserLevel };
