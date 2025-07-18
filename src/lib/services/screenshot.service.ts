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
    this.fileService = fileService;
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

  private async waitForMermaidDiagrams(page: any) {
    try {
      // Wait for all Mermaid diagrams to be rendered
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          const checkMermaidReady = () => {
            // Check if there are any Mermaid containers
            const mermaidContainers = document.querySelectorAll('[data-processed-by="mermaid"], .mermaid');

            if (mermaidContainers.length === 0) {
              // No Mermaid diagrams, resolve immediately
              resolve();
              return;
            }

            // Check if all Mermaid diagrams have SVG content
            const allRendered = Array.from(mermaidContainers).every(container => {
              const svg = container.querySelector('svg');
              return svg && svg.children.length > 0;
            });

            if (allRendered) {
              resolve();
            } else {
              // Check again in 100ms
              setTimeout(checkMermaidReady, 100);
            }
          };

          checkMermaidReady();
        });
      });

      this.logger.info('Mermaid diagrams rendered successfully');
    } catch (error) {
      this.logger.warn('Error waiting for Mermaid diagrams:', error);
      // Continue anyway after warning
    }
  }

  private async waitForKatex(page: any) {
    try {
      // Wait for KaTeX (LaTeX) to finish rendering
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          const checkKatexReady = () => {
            const katexElements = document.querySelectorAll('.katex');

            if (katexElements.length === 0) {
              resolve();
              return;
            }

            // Check if all KaTeX elements have been processed
            const allRendered = Array.from(katexElements).every(element => {
              return !element.textContent?.includes('\\') && element.children.length > 0;
            });

            if (allRendered) {
              resolve();
            } else {
              setTimeout(checkKatexReady, 100);
            }
          };

          checkKatexReady();
        });
      });

      this.logger.info('KaTeX formulas rendered successfully');
    } catch (error) {
      this.logger.warn('Error waiting for KaTeX:', error);
    }
  }

  private async waitForCodeHighlighting(page: any) {
    try {
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          const checkHighlightingReady = () => {
            const codeBlocks = document.querySelectorAll('pre code, .language-');

            if (codeBlocks.length === 0) {
              resolve();
              return;
            }

            const allHighlighted = Array.from(codeBlocks).every(block => {
              const hasHighlighting = block.querySelector('.token') ||
                block.classList.contains('hljs')
              return hasHighlighting || block.textContent?.trim() === '';
            });

            if (allHighlighted) {
              resolve();
            } else {
              setTimeout(checkHighlightingReady, 100);
            }
          };

          checkHighlightingReady();
        });
      });

      this.logger.info('Code highlighting completed');
    } catch (error) {
      this.logger.warn('Error waiting for code highlighting:', error);
    }
  }

  private async waitForAllContent(page: any) {
    try {
      // Wait for all dynamic content to be ready
      await Promise.all([
        this.waitForMermaidDiagrams(page),
        this.waitForKatex(page),
        this.waitForCodeHighlighting(page)
      ]);

      // Additional wait for any remaining async operations
      await page.evaluate(() => {
        return new Promise(resolve => setTimeout(resolve, 500));
      });

      this.logger.info('All content rendered and ready for screenshot');
    } catch (error) {
      this.logger.warn('Error in waitForAllContent:', error);
      // Add a fallback wait
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  public async takeScreenshot(url: string, videoId: string) {
    return this.errorHandler.handleError(async () => {
      const browser = await puppeteer.launch({
        executablePath: "/etc/profiles/per-user/baby/bin/brave",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
      });

      const page = await browser.newPage();

      // Set a longer timeout for complex pages
      page.setDefaultTimeout(120_000);

      // Set viewport before navigation
      await page.setViewport({ width: 1920, height: 1080 });

      this.logger.info(`Navigating to URL: ${url}`);

      // Navigate and wait for network to be mostly idle
      await page.goto(url, {
        timeout: 120_000,
        waitUntil: ['networkidle0', 'domcontentloaded']
      });

      this.logger.info('Page loaded, waiting for #rendered selector');

      await page.waitForSelector("#rendered", { timeout: 120_000 });

      this.logger.info('Basic render complete, waiting for dynamic content');

      await this.waitForAllContent(page);

      this.logger.info('Taking screenshot');

      const buffer = await page.screenshot({
        fullPage: false,
        type: 'jpeg',
        quality: 80,
        omitBackground: false
      });

      const path = await this.fileService.saveFile(
        buffer,
        this.getDirectoryPath(videoId),
        "jpeg"
      );

      await browser.close();

      this.logger.info(`Screenshot saved to: ${path}`);
      return path;

    }, {
      service: "ScreenshotService",
      method: "takeScreenshot"
    });
  }

  // Optional: Method to take screenshot with custom wait conditions
  public async takeScreenshotWithCustomWait(
    url: string,
    videoId: string,
    customWaitSelector?: string,
    additionalWaitTime?: number
  ) {
    return this.errorHandler.handleError(async () => {
      const browser = await puppeteer.launch({
        executablePath: "/etc/profiles/per-user/baby/bin/brave",
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, {
        timeout: 120_000,
        waitUntil: 'networkidle0'
      });

      // Wait for basic render
      await page.waitForSelector("#rendered", { timeout: 120_000 });

      // Wait for custom selector if provided
      if (customWaitSelector) {
        await page.waitForSelector(customWaitSelector, { timeout: 30_000 });
      }

      // Wait for all content
      await this.waitForAllContent(page);

      // Additional wait time if specified
      if (additionalWaitTime) {
        await new Promise(resolve => setTimeout(resolve, additionalWaitTime));
      }

      const buffer = await page.screenshot();
      const path = await this.fileService.saveFile(
        buffer,
        this.getDirectoryPath(videoId),
        "png"
      );

      await browser.close();
      return path;

    }, {
      service: "ScreenshotService",
      method: "takeScreenshotWithCustomWait"
    });
  }
}
