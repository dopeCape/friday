import { z } from "zod";

const moduleContentTypeSchema = z.enum(["chapter", "quiz", "assignment", "example"]);
const difficultyLevelSchema = z.enum(["beginner", "intermediate", "advanced", "expert"]);
const answerTypeSchema = z.enum(["code", "text", "mcq"]);

const courseSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  isPrivate: z.boolean(),
  isUnique: z.boolean(),
  icon: z.array(z.string()),
  templateId: z.string(),
  isFromTemplate: z.boolean(),
  createdBy: z.string(),
  isSystemGenerated: z.boolean(),
  technologies: z.array(z.string()),
  internalDescription: z.string(),
  moduleIds: z.array(z.string()),
  currentModuleId: z.string().optional(),
  isEnhanced: z.boolean(),
  difficultyLevel: difficultyLevelSchema,
  prerequisites: z.array(z.string()),
  estimatedCompletionTime: z.number(),
  learningObjectives: z.array(z.string()),
  keywords: z.array(z.string()),
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
  difficultyLevel: difficultyLevelSchema,
  prerequisites: z.array(z.string()),
  estimatedCompletionTime: z.number(),
  learningObjectives: z.array(z.string()),
  moduleType: z.enum(["content", "assignment"]),
});

const chapterContentSchema = z.object({
  type: z.enum(["text", "code", "diagram"]),
  content: z.string(),
  codeBlockLanguage: z.string().optional(),
});

const chapterSchema = z.object({
  _id: z.string(),
  title: z.string(),
  content: z.array(chapterContentSchema),
  isGenerated: z.boolean(),
  refs: z.array(z.string()),
  moduleId: z.string(),
  type: z.string().default(moduleContentTypeSchema.enum.chapter),
  isCompleted: z.boolean(),
  isUserSpecific: z.boolean(),
});


const assignmentSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  moduleId: z.string(),
  type: z.string().default(moduleContentTypeSchema.enum.assignment),
  isCompleted: z.boolean(),
  isSubmitted: z.boolean(),
  requirements: z.array(z.string()),
  estimatedCompletionTime: z.number(), // in hours
  learningObjectives: z.array(z.string()),
});

const questionSchema = z.object({
  _id: z.string(),
  question: z.string(),
  answerType: answerTypeSchema,
  isCorrect: z.boolean(),
  isAnswered: z.boolean(),
  options: z.array(z.string()).optional(),
  answer: z.union([z.string(), z.number()]).optional(),
  codeBlockType: z.string().optional(),
  explanation: z.string(),
  difficulty: difficultyLevelSchema,
  hints: z.array(z.string()).optional(),
});

const quizSchema = z.object({
  _id: z.string(),
  moduleId: z.string(),
  questions: z.array(questionSchema),
  type: z.string(),
  passingScore: z.number(),
  maxAttempts: z.number(),
  currentScore: z.number(),
});

export const chapterContentGenerationSchema = z.object({
  title: z.string().describe("title of the chapter"),
  estimatedCompletionTime: z.number().describe("Estimated minutes to complete this chapter")
});


const createNewCourseSchema = z.object({
  userId: z.string(),
  isPrivate: z.boolean(),
  isSystemGenerated: z.boolean(),
  prompt: z.string(),
  isEnhanced: z.boolean(),
  targetDifficultyLevel: difficultyLevelSchema.optional(),
  desiredCompletionTime: z.number().optional(),
});



const quizContentGenerationSchema = z.object({
  passingScore: z.number().describe("How many right question before passing the quiz"),
  maxAttempts: z.number().describe("How many times the user can attempt the quiz"),
  questions: z.array(z.object({
    question: z.string().describe("question text"),
    answerType: answerTypeSchema.describe("Type of expected answer"),
    options: z.array(z.string()).describe("options if the type is mcq").optional(),
    codeBlockType: z.string().describe("language of the code block").optional(),
    explanation: z.string().describe("Explanation for the correct answer"),
    difficulty: difficultyLevelSchema,
    hints: z.array(z.string()).optional().describe("hints for the question"),
  }))
})

const courseGenerationSchema = z.object({
  title: z.string().describe("title of the course, max 4 words"),
  description: z.string().describe("description of the course, should be very short , brief, and up to the point"),
  iconQuery: z.array(z.array(z.string().describe("Nerd font icon search query "))).max(3).min(3),
  technologies: z.array(z.string()).describe("technologies that will be used in this course"),
  difficultyLevel: difficultyLevelSchema.describe("difficulty level of the course, beginner, intermediate, advanced, expert"),
  prerequisites: z.array(z.string()).describe("Prerequisites of the course"),
  estimatedCompletionTime: z.number().describe("Esimated hours to complete the course"),
  learningObjectives: z.array(z.string()).describe("List of objective for this course"),
  keywords: z.array(z.string()).describe("Keywords for the course, used for search"),
  internalDescription: z.string().describe("Internal description of the course, used for semantic search"),
  modules: z.array(z.object({
    title: z.string().describe("title of the module"),
    description: z.string().describe("description of the module"),
    topicsToCover: z.string().describe("Topics that needs to be taught in this module ")
  }))
})


const moduleContentSchema = z.object({
  title: z.string().describe("title of the module"),
  description: z.string().describe("description of the module"),
  refs: z.array(z.string()).describe("Search query for articles / youtube vidoes that can help user in this module"),
  iconQuery: z.array(z.string().describe("Nerd font icon search query")),
  difficultyLevel: difficultyLevelSchema.describe("difficulty level of the module, beginner, intermediate, advanced, expert"),
  prerequisites: z.array(z.string()).describe("Prerequisites of the module"),
  estimatedCompletionTime: z.number().describe("Esimated hours to complete the module"),
  learningObjectives: z.array(z.string()).describe("Learning objectives from this module"),
  chapters: z.array(chapterContentGenerationSchema),
});

export {
  courseSchema,
  moduleSchema,
  chapterSchema,
  quizSchema,
  questionSchema,
  answerTypeSchema,
  createNewCourseSchema,
  moduleContentTypeSchema,
  difficultyLevelSchema,
  assignmentSchema,
  courseGenerationSchema,
  moduleContentSchema
}
