import UserRepository from "@/lib/repository/mongoose/user.mongoose.repository";
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

