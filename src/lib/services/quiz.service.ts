import { Logger, Quiz, QuizRepository as QuizRepositoryType } from "@/types"
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
export default class QuizService {
  private logger: Logger;
  private static instance: QuizService;
  private quizRepository: QuizRepositoryType;
  private errorHandler: CentralErrorHandler;

  private constructor(logger: Logger, quizRepository: QuizRepositoryType) {
    this.logger = logger;
    this.quizRepository = quizRepository;
    this.errorHandler = new CentralErrorHandler(logger);
  }

  public static getInstance(logger: Logger, quizRepository: QuizRepositoryType) {
    if (!this.instance) {
      const quizService = new QuizService(logger, quizRepository);
      this.instance = quizService;
    }
    return this.instance
  }

  public async createQuizs(quizs: Quiz[]) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Creaing multiple quiz", { quizs });
      return await this.quizRepository.createMany(quizs);
    }, {
      service: "QuizService",
      method: "createQuizs"
    })
  }
}
