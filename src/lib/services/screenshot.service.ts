import { Logger } from "@/types";
import puppeteer from 'puppeteer';
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";

export default class ScreenshotService {
  private static instance: ScreenshotService | null;
  private logger: Logger;
  private errorHandler: CentralErrorHandler
  private constructor(logger: Logger) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
  }
  public static getInstance(logger: Logger) {
    if (!this.instance) {
      this.instance = new ScreenshotService(logger);
    }
    return this.instance;
  }

  public async takeScreenshot(url: string) {
    return this.errorHandler.handleError(async () => {
      const browser = await puppeteer.launch(
        {
          executablePath: "/etc/profiles/per-user/baby/bin/brave",
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
      );
      const page = await browser.newPage();
      await page.goto("http://localhost:3000/");
      await page.setViewport({ width: 1920, height: 1080 });
      return await page.screenshot()
    }, {
      service: "ScreenshotService",
      method: "takeScreenshot"
    })
  }


}
