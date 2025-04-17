import { Logger, Chapter, ChapterRepository as ChapterRepositoryType } from "@/types"
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
export default class ChapterService {
  private logger: Logger;
  private static instance: ChapterService;
  private ChapterRepository: ChapterRepositoryType;
  private errorHandler: CentralErrorHandler;

  private constructor(logger: Logger, chapterRepository: ChapterRepositoryType) {
    this.logger = logger;
    this.ChapterRepository = chapterRepository;
    this.errorHandler = new CentralErrorHandler(logger);
  }

  public static getInstance(logger: Logger, chapterRepository: ChapterRepositoryType) {
    if (!this.instance) {
      const chapterService = new ChapterService(logger, chapterRepository);
      this.instance = chapterService;
    }
    return this.instance
  }

  public async createChapters(chapters: Chapter[]) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Creaing multiple Chapter", { chapters });
      return await this.ChapterRepository.createMany(chapters);
    }, {
      service: "ChapterService",
      method: "createChapters"
    })
  }
}
