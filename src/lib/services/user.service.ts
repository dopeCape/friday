import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { Logger, User, UserLevel, UserOs, WithoutId } from "@/types"
import { UserRepository as UserRepositoryType } from "@/types/signatures/userRepository.signature";
import { AppError } from "../errorHandler/appError";

export default class UserService {
  private logger: Logger;
  private static instance: UserService;
  private userRepository: UserRepositoryType;
  private errorHandler: CentralErrorHandler;

  private constructor(logger: Logger, userRepository: UserRepositoryType) {
    this.logger = logger;
    this.userRepository = userRepository;
    this.errorHandler = new CentralErrorHandler(logger);
  }

  public static getInstance(logger: Logger, userRepository: UserRepositoryType) {
    if (!this.instance) {
      const userService = new UserService(logger, userRepository);
      this.instance = userService;
    }
    return this.instance
  }

  public async createUser(user: WithoutId<User>) {
    return this.errorHandler.handleError(async () => {
      if ((user as unknown as User)._id) {
        this.logger.warn("User id present in user object", { user });
        delete (user as any)._id
      }
      const createdUser = await this.userRepository.create(user);
      return createdUser;
    }, {
      service: "UserService",
      method: "createUser"
    });
  }

  public async checkIfUserExists(email: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Checking if user exists", { email });
      const user = await this.userRepository.get({ email })
      return user ? true : false;
    }, {
      service: "UserService",
      method: "checkIfUserExists"
    })
  }
  public async deleteUser(email: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Deleting user with ", { email });
      return await this.userRepository.delete({ email });
    }, {
      service: "UserService",
      method: "deleteUser"
    })
  }
  public async deleteUserWithClerkId(clerkId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Deleting user with ", { clerkId });
      return await this.userRepository.delete({ clerkId });
    }, {
      service: "UserService",
      method: "deleteUser"
    })
  }

  public async checkIfUserIsOnboarded(clerkId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Checking if user is onboarded", { clerkId });
      const user = await this.userRepository.get({ clerkId });
      if (!user) {
        throw new AppError(404, "User not found", "UserDoesNotExists");
      }
      if (user.stats.level) {
        return true
      }
      return false
    }, {
      service: "UserService",
      method: "checkIfUserIsOnboarded"
    })
  }

  public async onboardUser(clerkId: string, level: UserLevel, stack: string[], os: UserOs, knowsBasicCommands: boolean, knowsGit: boolean) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Onboarding user", { clerkId });
      const user = await this.userRepository.get({ clerkId });
      if (!user) {
        throw new AppError(404, "User not found", "UserDoesNotExists");
      }
      const updatedUser = await this.userRepository.update({ clerkId }, { $set: { stats: { level, stack, os, knowsBasicCommands, knowsGit } } });
      return updatedUser;
    }, {
      service: "UserService",
      method: "onboardUser"
    })
  }

  public async getUserPreferences(clerkId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting user preferences", { clerkId });
      const user = await this.userRepository.get({ clerkId });
      if (!user) {
        throw new AppError(404, "User not found", "UserDoesNotExists");
      }
      return user.stats;
    }, {
      service: "UserService",
      method: "getUserPreferences"
    })
  }

}
