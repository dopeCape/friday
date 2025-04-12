import { Logger, User } from "@/types"
import { userLevelSchema, userOsSchema } from "@/lib/schemas"
import { Model, Schema, model, models } from "mongoose";
import { MongooseBaseRepository } from "./base.mongoose.repository";

const userSchema = new Schema<User>({
  name: {
    type: String,
    required: true,
    maxlength: 50,
    default: ""
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profileImage: {
    type: String,
    required: true,
    default: ""
  },
  clerkId: {
    type: String,
    required: true,
  },
  stats: {
    level: {
      type: String,
      enum: userLevelSchema.enum,
    },
    stack: {
      type: [{ type: String }],
      required: false,
    },
    os: {
      type: String,
      enum: userOsSchema.enum,
    },
    knowsBasicCommands: {
      type: Boolean,
    },
  },
})


export default class UserRepository extends MongooseBaseRepository<User> {
  private static instance: UserRepository | null = null
  private constructor(model: Model<User>, logger: Logger) {
    super(logger, model, "user")
  }
  public static getInstance(logger: Logger) {
    if (!UserRepository.instance) {
      const userModel = models.user || model("user", userSchema)
      UserRepository.instance = new UserRepository(userModel, logger)
    }
    return UserRepository.instance
  }
}

