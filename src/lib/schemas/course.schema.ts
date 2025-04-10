import { z } from "zod";
const moduleContentTypeSchema = z.enum(["chapter", "quiz"]);

const courseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  isPrivate: z.boolean(),
  icon: z.array(z.string()),
  createdBy: z.string(),
  isSystemGenerated: z.boolean(),
  technologies: z.array(z.string()),
  internalDescription: z.string(),
  moduleIds: z.array(z.string()),
  currentModuleId: z.string(),
});

const moduleContentSchema = z.object({
  type: moduleContentTypeSchema,
  id: z.string()
})

const moduleSchema = z.object({
  title: z.string(),
  id: z.string(),
  description: z.string(),
  courseId: z.string(),
  refs: z.array(z.string()),
  contentIds: z.array(moduleContentSchema),
  isLocked: z.boolean(),
  isCompleted: z.boolean(),
  currentChapterId: z.string(),
  icon: z.string(),
});

const chapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  isGenerated: z.string(),
  refs: z.array(z.string()),
  moduleId: z.string(),
  isCommpleted: z.boolean(),
});
const answerTypeSchema = z.enum(["code", "text", "mcq"])

const questionSchema = z.object({
  question: z.string(),
  answerType: answerTypeSchema,
  options: z.array(z.string()),
  answer: z.union([z.string(), z.number()]),
  codeBlockType: z.array(z.string())
})

const quizSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  questions: z.array(questionSchema)
})

export {
  courseSchema,
  moduleSchema,
  chapterSchema,
  quizSchema
}
