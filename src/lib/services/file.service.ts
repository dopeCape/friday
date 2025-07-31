import { Logger } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { v4 } from "uuid";
import fs from "fs";

export default class FileService {
  private static instance: FileService | null;
  private logger: Logger;
  private errorHandler: CentralErrorHandler;

  private constructor(logger: Logger) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
  }

  public static getInstance(logger: Logger): FileService {
    if (!this.instance) {
      this.instance = new FileService(logger);
    }
    return this.instance;
  }

  private generateRandomFileName(path: string, extension: string): string {
    const completePath = `${path}/${v4()}.${extension}`;
    this.logger.info("Created complete path", {
      path,
      completePath,
      extension,
    });
    return completePath;
  }

  public async cleanUp(folderPath: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Cleaning Up", {
        folderPath,
      })
      await fs.promises.rm(folderPath, { recursive: true, force: true });
    }, {
      service: "FileService",
      method: "cleanUp"
    })
  }

  public async saveFile(data: any, path: string, extension: string): Promise<string> {
    return this.errorHandler.handleError(async () => {
      await fs.promises.mkdir(path, { recursive: true });
      const completePath = this.generateRandomFileName(path, extension);
      await fs.promises.writeFile(completePath, data);
      return completePath;
    }, {
      service: "FileService",
      method: "saveFile",
    });
  }
}
