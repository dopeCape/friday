import { Logger } from "@/types"
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";

import env from "@/config/env.config";
import { TavilySearch } from "@langchain/tavily";

export default class SearchService {
  private logger: Logger
  private static instance: SearchService | null
  private errorHandler: CentralErrorHandler;
  public static getInstance(logger: Logger) {
    if (!this.instance) {
      this.instance = new SearchService(logger);
    }
    return this.instance
  }

  private constructor(logger: Logger) {
    this.logger = logger
    this.errorHandler = new CentralErrorHandler(logger);
  }

  public async search(query: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("searching", { query });
      const tool = new TavilySearch({
        maxResults: 5,
        tavilyApiKey: env.TAVILY_API_KEY
      });
      const result = await tool.invoke({
        query
      })
      this.logger.info("search result", { result });
      return result
    }, {
      method: "search",
      service: "SearchService"
    })
  }
}
