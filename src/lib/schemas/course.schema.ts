import { z } from "zod";

const moduleContentTypeSchema = z.enum(["chapter", "quiz", "assignment", "example"]);
const difficultyLevelSchema = z.enum(["beginner", "intermediate", "advanced", "expert"]);
const answerTypeSchema = z.enum(["code", "text", "mcq"]);

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
  currentModuleId: z.string().optional(),
  isEnhanced: z.boolean(),
  difficultyLevel: difficultyLevelSchema,
  prerequisites: z.array(z.string()),
  estimatedCompletionTime: z.number(),
  learningObjectives: z.array(z.string()),
  keywords: z.array(z.string()),
  communityResources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.enum(["forum", "discord", "github", "other"])
  })),
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
  type: z.string().default(moduleContentTypeSchema.enum.quiz),
  passingScore: z.number(),
  maxAttempts: z.number().default(1),
  currentScore: z.number(),
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

const chapterContentGenerationSchema = z.object({
  title: z.string().describe("title of the chapter"),
  references: z.array(z.string()).describe("References for the chapter, articles, books, videos, repositories"),
  learningObjectives: z.array(z.string()).describe("List of objective for this chapter"),
})


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
  title: z.string().describe("title of the course"),
  description: z.string().describe("description of the course"),
  icon: z.array(z.string()).describe("Nerd font icons that perfectly , appropreate for the course, about 2-5 will be enough"),
  technologies: z.array(z.string()).describe("technologies that will be used in this course"),
  difficultyLevel: difficultyLevelSchema.describe("difficulty level of the course, beginner, intermediate, advanced, expert"),
  prerequisites: z.array(z.string()).describe("Prerequisites of the course"),
  estimatedCompletionTime: z.number().describe("Esimated hours to complete the course"),
  learningObjectives: z.array(z.string()).describe("List of objective for this course"),
  keywords: z.array(z.string()).describe("Keywords for the course, used for search"),
  internalDescription: z.string().describe("Internal description of the course, used for semantic search"),
  communityResources: z.array(z.object({
    title: z.string().describe("Title of resource"),
    url: z.string().describe("Url for the resource"),
    type: z.enum(["forum", "discord", "github", "other"]).describe("Type of resource")
  })),
  modules: z.array(z.object({
    title: z.string().describe("title of the module"),
    description: z.string().describe("description of the module"),
    icon: z.string().describe("Nerd font icons that perfectly , appropreate for the module"),
    references: z.array(z.string()).describe("References for the module, articles, books, videos, repositories"),
    difficultyLevel: difficultyLevelSchema.describe("difficulty level of the module, beginner, intermediate, advanced, expert"),
    prerequisites: z.array(z.string()).describe("Prerequisites of the module"),
    estimatedCompletionTime: z.number().describe("Esimated hours to complete the module"),
    learningObjectives: z.array(z.string()).describe("List of objective for this module"),
    moduleType: z.enum(["content", "assignment"]).describe("Type of module, content or assignment"),
    chapters: z.array(chapterContentGenerationSchema),
    quize: quizContentGenerationSchema,
  }))
})


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
  courseGenerationSchema
}
