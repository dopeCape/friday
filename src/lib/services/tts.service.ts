import { Logger, TTSOpts } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import OpenAI from 'openai';
import env from "@/config/env.config";
import FileService from "./file.service";
export default class TTSService {
  private logger: Logger;
  private tempDir = env.TEMP_PATH;
  private errorHandler: CentralErrorHandler;
  private static instance: TTSService | null;
  private client: OpenAI;
  private fileService: FileService;
  private constructor(logger: Logger, fileService: FileService) {
    this.logger = logger;
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    })
    this.errorHandler = new CentralErrorHandler(logger);
    this.fileService = fileService;
  }

  static getInstance(logger: Logger, fileService: FileService) {
    if (!this.instance) {
      this.instance = new TTSService(logger, fileService);
    }
    return this.instance;
  }
  private getDirectoryPath(videoId: string) {
    return `${this.tempDir}/${videoId}`;
  }

  public async generateTTS(text: string, videoId: string, opts: TTSOpts) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Generating tts for text", { text });
      const response = await this.client.audio.speech.create({
        input: text,
        model: opts.model,
        voice: opts.voice,
      })
      const buffer = Buffer.from(await response.arrayBuffer());
      const path = this.getDirectoryPath(videoId);
      const savedFile = this.fileService.saveFile(buffer, path, "mp3");
      return savedFile;
    }, {
      service: "TTSService",
      method: "generateTTS"
    })
  }
}
