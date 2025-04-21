import env from "@/config/env.config";
import VectorDbService from "../services/vectorDb.service";


export default class IconsProvider {
  private static instance: IconsProvider | null
  private vectorDbService: VectorDbService;

  private constructor(vectorDbService: VectorDbService) {
    this.vectorDbService = vectorDbService;
  }
  public static getInstance(vectorDbService: VectorDbService) {
    if (!this.instance) {
      this.instance = new IconsProvider(vectorDbService);
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
    const results = await this.vectorDbService.topK(query, 1, {
      index: env.ICONS_PINECONE_INDEX,
      model: env.DEFAULT_EMBEDDING_MODEL,
      includeMetadata: true
    })
    return (results[0].metadata)?.iconName as string || ""
  }
}
