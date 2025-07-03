import { Logger } from "@/types";
import puppeteer from 'puppeteer';
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import FileService from "./file.service";
import env from "@/config/env.config";

export default class ScreenshotService {
  private static instance: ScreenshotService | null;
  private logger: Logger;
  private tempPath = env.TEMP_PATH;
  private fileService: FileService;
  private errorHandler: CentralErrorHandler;
  private constructor(logger: Logger, fileService: FileService) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
    this.fileService = fileService
  }
  public static getInstance(logger: Logger, fileService: FileService) {
    if (!this.instance) {
      this.instance = new ScreenshotService(logger, fileService);
    }
    return this.instance;
  }

  private getDirectoryPath(videoId: string) {
    return `${this.tempPath}/${videoId}`;
  }

  public async takeScreenshot(url: string, videoId: string) {
    return this.errorHandler.handleError(async () => {
      const browser = await puppeteer.launch(
        {
          executablePath: "/etc/profiles/per-user/baby/bin/brave",
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
      );
      const page = await browser.newPage();
      await page.goto(url, { timeout: 100_000 });
      await page.setViewport({ width: 1920, height: 1080 });
      await page.waitForSelector("#rendered", { timeout: 100_000 });
      const buffer = await page.screenshot();
      const path = await this.fileService.saveFile(buffer, this.getDirectoryPath(videoId), "png");
      await browser.close();
      return path;
    }, {
      service: "ScreenshotService",
      method: "takeScreenshot"
    })
  }
}
