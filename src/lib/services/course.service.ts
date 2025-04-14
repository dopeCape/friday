import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { Logger, WithoutId } from "@/types"
import { CourseRepository as CourseRepositoryType } from "@/types";

export default class CourseService {
  private logger: Logger;
  private static instance: CourseService;
  private courseRepositor: CourseRepositoryType;
  private errorHandler: CentralErrorHandler;

  private constructor(logger: Logger, courseRepository: CourseRepositoryType) {
    this.logger = logger;
    this.courseRepositor = courseRepository;
    this.errorHandler = new CentralErrorHandler(logger);
  }

  public static getInstance(logger: Logger, courseRepositor: CourseRepositoryType) {
    if (!this.instance) {
      const courseService = new CourseService(logger, courseRepositor);
      this.instance = courseService;
    }
    return this.instance
  }
  public async createCourse() {
    return this.errorHandler.handleError(async () => {
    }, {
      service: "CourseService",
      method: "createCourse"
    })
  }
}
