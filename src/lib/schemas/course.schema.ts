import { z } from "zod";
const moduleContentTypeSchema = z.enum(["chapter", "quiz"]);

const courseSchema = z.object({
  _id: z.string(),
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
  isEnhanced: z.boolean(),

});

const moduleSchema = z.object({
  title: z.string(),
  _id: z.string(),
  description: z.string(),
  courseId: z.string(),
  refs: z.array(z.string()),
  contents: z.array(z.string()),
  isLocked: z.boolean(),
  isCompleted: z.boolean(),
  currentChapterId: z.string(),
  icon: z.string(),
});


const chapterSchema = z.object({
  _id: z.string(),
  title: z.string(),
  content: z.string(),
  isGenerated: z.boolean(),
  refs: z.array(z.string()),
  moduleId: z.string(),
  type: z.string().default(moduleContentTypeSchema.enum.chapter),
  isCommpleted: z.boolean(),
});
const answerTypeSchema = z.enum(["code", "text", "mcq"])
const questionSchema = z.object({
  _id: z.string(),
  question: z.string(),
  answerType: answerTypeSchema,
  isCorrect: z.boolean(),
  isAnswered: z.boolean(),
  options: z.array(z.string()),
  answer: z.union([z.string(), z.number()]),
  codeBlockType: z.string()
})
const quizSchema = z.object({
  _id: z.string(),
  moduleId: z.string(),
  questions: z.array(questionSchema),
  type: z.string().default(moduleContentTypeSchema.enum.quiz),
})


const createNewCourseSchema = z.object({
  userId: z.string(),
  isPrivate: z.string(),
  isSystemGenerated: z.boolean(),
  prompt: z.string(),
  isEnhanced: z.boolean(),
})

export {
  courseSchema,
  moduleSchema,
  chapterSchema,
  quizSchema,
  questionSchema,
  answerTypeSchema,
  createNewCourseSchema
}
