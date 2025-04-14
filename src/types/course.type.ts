import { z } from "zod";
import {
  courseSchema,
} from "@/lib/schemas"

type Course = z.infer<typeof courseSchema>

export type {
  Course
}

