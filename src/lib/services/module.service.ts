import { Logger, Module, ModuleRepository as ModuleRepositoryType } from "@/types"
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
export default class ModuleService {
  private logger: Logger;
  private static instance: ModuleService;
  private moduleRepository: ModuleRepositoryType;
  private errorHandler: CentralErrorHandler;

  private constructor(logger: Logger, moduleRepository: ModuleRepositoryType) {
    this.logger = logger;
    this.moduleRepository = moduleRepository;
    this.errorHandler = new CentralErrorHandler(logger);
  }

  public static getInstance(logger: Logger, moduleRepository: ModuleRepositoryType) {
    if (!this.instance) {
      const moduleService = new ModuleService(logger, moduleRepository);
      this.instance = moduleService;
    }
    return this.instance
  }

  public async createModules(modules: Module[]) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Creaing multiple modules", { modules });
      return await this.moduleRepository.createMany(modules);
    }, {
      service: "ModuleService",
      method: "createModule"
    })


  }

}
