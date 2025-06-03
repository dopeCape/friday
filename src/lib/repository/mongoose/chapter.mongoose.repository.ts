import { Chapter, Logger } from "@/types";
import { MongooseBaseRepository } from "./base.mongoose.repository";
import { model, Model, models, Schema } from "mongoose";

const chapterSchema = new Schema<Chapter>({
  title: {
    required: true,
    type: String,
  },
  content: [{
    type: {
      type: String,
      required: true,
      enum: ["text", "code", "diagram"],
    },
    content: {
      type: String,
      required: true,
    },
    codeBlockLanguage: String,
  }],
  isGenerated: {
    required: true,
    type: Boolean,
  },
  refs: [{
    required: true,
    type: String,
  }],
  moduleId: {
    required: true,
    type: String,
  },
  type: {
    required: true,
    type: String,
    default: "chapter"
  },
  isCompleted: {
    required: true,
    type: Boolean,
  },

}, { timestamps: true, })

export class ChapterRepository extends MongooseBaseRepository<Chapter> {
  private static instance: ChapterRepository | null = null
  private constructor(model: Model<Chapter>, logger: Logger) {
    super(logger, model, "chapter")
  }
  public static getInstance(logger: Logger) {
    if (!ChapterRepository.instance) {
      const chapterModel = models.chapter || model("chapter", chapterSchema)
      ChapterRepository.instance = new ChapterRepository(chapterModel, logger)
    }
    return ChapterRepository.instance
  }
}  
