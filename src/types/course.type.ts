import { z } from "zod";
import {
  courseSchema,
  createNewCourseSchema
} from "@/lib/schemas"

type Course = z.infer<typeof courseSchema>
type NewCourse = z.infer<typeof createNewCourseSchema>;

export type {
  Course,
  NewCourse
}

