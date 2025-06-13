import { Question, Logger, Quiz } from "@/types";
import { MongooseBaseRepository } from "./base.mongoose.repository";
import { model, Model, models, Schema } from "mongoose";
import { answerTypeSchema, difficultyLevelSchema } from "@/lib/schemas";
const questionSchema = new Schema<Question>({
  question: { required: true, type: String },
  answerType: { type: String, required: true, enum: answerTypeSchema.enum },
  isCorrect: { required: true, type: Boolean },
  isAnswered: { required: true, type: Boolean, default: false },
  options: [{
  }],
  answer: {
    type: String || Number,
  },
  codeBlockType: { type: String, required: false },
  explanation: { type: String, required: false },
  difficulty: {
    type: String,
    enum: difficultyLevelSchema.options,
    required: true,
  },
  hints: [{
    type: String,
    required: true,
  }],

}, { timestamps: true, })

const quizSchema = new Schema<Quiz>({
  moduleId: { type: String, required: true },
  questions: [questionSchema],
  type: {
    required: true,
    type: String,
    default: "quiz"
  },
  passingScore: {
    type: Number,
    required: true,
  },
  currentScore: {
    type: Number,
  }
})
export class QuizRepository extends MongooseBaseRepository<Quiz> {
  private static instance: QuizRepository | null = null
  private constructor(model: Model<Quiz>, logger: Logger) {
    super(logger, model, "quiz")
  }
  public static getInstance(logger: Logger) {
    if (!QuizRepository.instance) {
      const quizModel = models.quiz || model("quiz", quizSchema)
      QuizRepository.instance = new QuizRepository(quizModel, logger)
    }
    return QuizRepository.instance
  }
}   
