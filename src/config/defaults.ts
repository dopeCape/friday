import CourseRepository from "@/lib/repository/mongoose/course.mongoose.repository";
import UserRepository from "@/lib/repository/mongoose/user.mongoose.repository";
import CourseService from "@/lib/services/course.service";
import { Logger } from "@/lib/services/logger.service";
import UserService from "@/lib/services/user.service";


export function getDefaultLogger() {
  const logger = Logger.getInstance();
  return logger;
}

export function getDefaultUserService() {
  const logger = getDefaultLogger();
  const userRepository = UserRepository.getInstance(logger);
  return UserService.getInstance(logger, userRepository);
}

export function getDefaultCourseRepository() {
  const logger = getDefaultLogger();
  return CourseRepository.getInstance(logger)
}

export function getDefaultCourseService() {
  const logger = getDefaultLogger();
  const courseRepository = getDefaultCourseRepository()
  return CourseService.getInstance(logger, courseRepository);
}
