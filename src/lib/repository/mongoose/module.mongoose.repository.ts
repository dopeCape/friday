import { Logger } from "@/types"
import { Module } from "@/types";
import { MongooseBaseRepository } from "./base.mongoose.repository";
import { model, Model, models, Schema } from "mongoose";
import { difficultyLevelSchema } from "@/lib/schemas";
const moduleSchema = new Schema<Module>({
  title: {
    required: true,
    type: String,
  },
  description: {
    required: true,
    type: String,
  },
  courseId: {
    required: true,
    type: String,
  },
  refs: [{
    required: true,
    type: String,
  }],
  contents: [{
    required: true,
    type: String,
  }],
  isLocked: {
    required: true,
    type: Boolean,
    default: true,
  },
  isCompleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  currentChapterId: {
    required: true,
    type: String,
  },
  icon: {
    required: true,
    type: String,
  },
  difficultyLevel: {
    type: String,
    enum: difficultyLevelSchema.options,
    required: true,
  },
  prerequisites: [{
    type: String,
    required: true,
  }],
  estimatedCompletionTime: {
    type: Number,
    required: true,
  },
  learningObjectives: [{
    type: String,
    required: true,
  }],
  moduleType: { type: String, enum: ["content", "assignment"], required: true },
}, { timestamps: true, })

export class ModuleRepository extends MongooseBaseRepository<Module> {
  private static instance: ModuleRepository | null = null
  private constructor(model: Model<Module>, logger: Logger) {
    super(logger, model, "module")
  }
  public static getInstance(logger: Logger) {
    if (!ModuleRepository.instance) {
      const moduleModel = models.module || model("module", moduleSchema)
      ModuleRepository.instance = new ModuleRepository(moduleModel, logger)
    }
    return ModuleRepository.instance
  }
} 
