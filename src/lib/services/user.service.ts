import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { Logger, User, WithoutId } from "@/types"
import { UserRepository as UserRepositoryType } from "@/types/signatures/userRepository.signature";

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
}
