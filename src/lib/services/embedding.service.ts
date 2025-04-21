import { ConverstionType, LLMOpts, Logger } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { OpenAIEmbeddings } from "@langchain/openai";
import env from "@/config/env.config";

export default class EmbeddingService {
  private logger: Logger;
  private errorHandler: CentralErrorHandler;
  private static instance: EmbeddingService | null;

  private constructor(logger: Logger) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
  }
  public static getInstance(logger: Logger) {
    if (!this.instance) {
      this.instance = new EmbeddingService(logger);
    }
    return this.instance
  }

  public async getEmbeddings(query: string, model: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting embeddings", { query, model });
      const embeddingModel = new OpenAIEmbeddings({
        model: model,
        apiKey: env.OPENAI_API_KEY
      });
      const embeddings = await embeddingModel.embedQuery(query);
      return embeddings;
    }, {
      service: "EmbeddingService",
      method: "getEmbeddings"
    })
  }

}
