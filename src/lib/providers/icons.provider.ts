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

  public async searchIcons(query: string[]): Promise<string[]> {
    const icons: string[] = [];
    for (const icon of query) {
      icons.push(await this.searchIcon(icon))
    }
    return icons
  }

  public async searchIcon(query: string): Promise<string> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Searching for icon", { query });
      const results = await this.vectorDbService.topK(query, 1, {
        index: env.ICONS_PINECONE_INDEX,
        model: env.DEFAULT_EMBEDDING_MODEL,
        includeMetadata: true
      })
      this.logger.info("Searced icons", { results });
      return (results[0].metadata)?.iconName as string || ""

    }, {
      service: "IconsProvider",
      method: "searchIcon"
    })
  }
}
