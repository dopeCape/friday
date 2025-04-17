import { z } from "zod";
import {
  courseGenerationSchema,
  courseSchema,
  createNewCourseSchema
} from "@/lib/schemas"

type Course = z.infer<typeof courseSchema>
type NewCourse = z.infer<typeof createNewCourseSchema>;
type CourseGenreation = z.infer<typeof courseGenerationSchema>

export type {
  Course,
  NewCourse,
  CourseGenreation
}

