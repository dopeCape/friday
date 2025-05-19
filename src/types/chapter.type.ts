import { z } from "zod";
import {
  answerTypeSchema, chapterSchema, questionSchema, quizSchema,
  moduleContentTypeSchema,
  difficultyLevelSchema,
  assignmentSchema,
} from "@/lib/schemas";
type Chapter = z.infer<typeof chapterSchema>;
type Quiz = z.infer<typeof quizSchema>;
type Question = z.infer<typeof questionSchema>
type AnswerType = z.infer<typeof answerTypeSchema>
type ModuleContent = z.infer<typeof moduleContentTypeSchema>
type DifficultyLevel = z.infer<typeof difficultyLevelSchema>
type Assignment = z.infer<typeof assignmentSchema>

export type {
  Chapter, Quiz, Question, AnswerType,
  ModuleContent, DifficultyLevel, Assignment
}
