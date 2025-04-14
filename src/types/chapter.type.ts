import { z } from "zod";
import { answerTypeSchema, chapterSchema, questionSchema, quizSchema } from "@/lib/schemas";
type Chapter = z.infer<typeof chapterSchema>;
type Quiz = z.infer<typeof quizSchema>;
type Question = z.infer<typeof questionSchema>
type AnswerType = z.infer<typeof answerTypeSchema>

export type { Chapter, Quiz, Question, AnswerType }
