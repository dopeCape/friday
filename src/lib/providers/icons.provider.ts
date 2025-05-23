import env from "@/config/env.config";
import VectorDbService from "../services/vectorDb.service";
import { Logger } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";


export default class IconsProvider {
  private static instance: IconsProvider | null
  private vectorDbService: VectorDbService;
  private logger: Logger
  private errorHandler: CentralErrorHandler

  private constructor(vectorDbService: VectorDbService, logger: Logger) {
    this.vectorDbService = vectorDbService;
    this.logger = logger
    this.errorHandler = new CentralErrorHandler(logger);
  }
  public static getInstance(logger: Logger, vectorDbService: VectorDbService) {
    if (!this.instance) {
      this.instance = new IconsProvider(vectorDbService, logger);
    }
    return this.instance;
  }



  public async searchIconsBatch(queries: string[]): Promise<string[]> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Batch searching for icons", { queries });

      if (queries.length === 0) return [];

      const batchResults = await this.vectorDbService.batchTopK(queries, 1, {
        index: env.ICONS_PINECONE_INDEX,
        model: env.DEFAULT_EMBEDDING_MODEL,
        includeMetadata: true,
        concurrency: 3
      });

      const icons = batchResults.map(result => {
        if (result.success && result.matches.length > 0) {
          return (result.matches[0].metadata)?.iconName as string || "";
        }
        this.logger.warn(`Failed to get icon for query: ${result.query}`, result.error);
        return "";
      });

      this.logger.info("Batch searched icons", {
        totalQueries: queries.length,
        successfulIcons: icons.filter(icon => icon !== "").length
      });

      return icons;
    }, {
      service: "IconsProvider",
      method: "searchIconsBatch"
    });
  }

  public async searchIcon(query: string): Promise<string> {
    const results = await this.searchIconsBatch([query]);
    return results[0] || "";
  }

  public async searchIcons(queries: string[]): Promise<string[]> {
    return this.searchIconsBatch(queries);
  }

}
