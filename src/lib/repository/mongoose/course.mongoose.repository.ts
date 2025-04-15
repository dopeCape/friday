import { Course, Logger, } from "@/types";
import { MongooseBaseRepository } from "./base.mongoose.repository";
import { Model, Schema, model, models } from "mongoose";
const courseSchema = new Schema<Course>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isPrivate: {
    type: Boolean,
    required: true,
  },
  icon: {
    type: [String],
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  isSystemGenerated: {
    type: Boolean,
    required: true,
  },
  technologies: {
    type: [String],
    required: true,
  },
  internalDescription: {
    type: String,
    required: true,
  },
  moduleIds: {
    type: [String],
    required: true,
  },
  currentModuleId: {
    type: String,
    required: true,
  },
  isEnhanced: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true,
})
export default class CourseRepository extends MongooseBaseRepository<Course> {
  private static instance: CourseRepository | null = null
  private constructor(model: Model<Course>, logger: Logger) {
    super(logger, model, "course")
  }
  public static getInstance(logger: Logger) {
    if (!CourseRepository.instance) {
      const courseModel = models.course || model("course", courseSchema)
      CourseRepository.instance = new CourseRepository(courseModel, logger)
    }
    return CourseRepository.instance
  }
}


