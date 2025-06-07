import { z } from "zod";
import {
  courseGenerationSchema,
  courseSchema,
  createNewCourseSchema
} from "@/lib/schemas"
import { Module } from "./module.type";
import { Chapter } from "./chapter.type";

type Course = z.infer<typeof courseSchema>
type NewCourse = z.infer<typeof createNewCourseSchema>;
type CourseGenreation = z.infer<typeof courseGenerationSchema>
interface CourseData {
  modules: Module[];
  chapters: Chapter[]
  course: Course
}

export type {
  Course,
  NewCourse,
  CourseGenreation,
  CourseData
}

