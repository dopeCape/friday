import { Logger } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { Pinecone } from '@pinecone-database/pinecone';
import env from "@/config/env.config";
import EmbeddingService from "./embedding.service";


export default class VectorDbService {
  private errorHandler: CentralErrorHandler;
  private logger: Logger;
  private static Instance: VectorDbService | null
  private pinecone = new Pinecone({
    apiKey: env.PINECONE_API_KEY,
    maxRetries: 10,
  });
  private embeddingService: EmbeddingService;

  private constructor(logger: Logger, embeddingService: EmbeddingService) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
    this.embeddingService = embeddingService;
  }

  public static getInstance(logger: Logger, embeddingService: EmbeddingService) {
    if (!this.Instance) {
      this.Instance = new VectorDbService(logger, embeddingService)
    }
    return this.Instance
  }

  public async save(data: string, id: string, metadata: Record<string, any>, opts: {
    index: string,
    model: string,
    namespace?: string,
  }) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Saving to vector db", { data, metadata });
      const embeddings = await this.embeddingService.getEmbeddings(data, opts.model);
      const namespace = this.pinecone.index(opts.index).namespace(opts.namespace || "")
      await namespace.upsert([
        {
          id,
          values: embeddings,
          metadata,
        }
      ])
    }, {
      service: "VectorDbService",
      method: "save"
    })
  }
  public async saveMultiple(records: { data: string, id: string, metadata: Record<string, any> }[], opts: {
    index: string,
    model: string,
    namespace?: string,
  }) {
    return this.errorHandler.handleError(async () => {
      try {
        this.logger.info("Saving to vector db", { records });
        const embaddedData = await Promise.all(records.map(async (record) => {
          const embeddings = await this.embeddingService.getEmbeddings(record.data, opts.model);
          return {
            id: record.id,
            values: embeddings,
            metadata: record.metadata
          }
        }))
        const namespace = this.pinecone.index(opts.index).namespace(opts.namespace || "")
        await namespace.upsert(embaddedData)
      } catch (error) {
        console.log(error);
        throw error
      }

    }, {
      service: "VectorDbService",
      method: "saveMultiple"
    })
  }


  public async topK(query: string, topK: number, opts: {
    index: string,
    model: string
    nameSpace?: string,
    includeMetadata: boolean
    filter?: Record<string, string>
  }) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting top k", { query, topK, opts });
      const embeddings = await this.embeddingService.getEmbeddings(query, opts.model);
      const namespace = this.pinecone.index(opts.index).namespace(opts.nameSpace || "");
      const topKResults = await namespace.query({
        vector: embeddings,
        topK: topK,
        includeMetadata: opts.includeMetadata,
        filter: opts.filter
      })
      this.logger.info("top k results", { topKResults });
      return topKResults.matches
    }, {
      service: "VectorDbService",
      method: "topK"
    })
  }
  public async batchTopK(queries: string[], topK: number, opts: {
    index: string,
    model: string
    nameSpace?: string,
    includeMetadata: boolean
    filter?: Record<string, string>,
    concurrency?: number // Control concurrent requests
  }) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting batch top k", { queries, topK, opts });

      const embeddings = await Promise.all(
        queries.map(query => this.embeddingService.getEmbeddings(query, opts.model))
      );

      const namespace = this.pinecone.index(opts.index).namespace(opts.nameSpace || "");

      const concurrency = opts.concurrency || 5
      const results: any[] = [];

      for (let i = 0; i < embeddings.length; i += concurrency) {
        const batch = embeddings.slice(i, i + concurrency);
        const batchQueries = queries.slice(i, i + concurrency);

        this.logger.info(`Processing batch ${Math.floor(i / concurrency) + 1}`, {
          batchSize: batch.length,
          queries: batchQueries
        });

        const batchResults = await Promise.all(
          batch.map(async (embedding, index) => {
            try {
              const result = await namespace.query({
                vector: embedding,
                topK: topK,
                includeMetadata: opts.includeMetadata,
                filter: opts.filter
              });
              return {
                query: batchQueries[index],
                matches: result.matches,
                success: true
              };
            } catch (error) {
              this.logger.error(`Failed to query for: ${batchQueries[index]}`, error);
              return {
                query: batchQueries[index],
                matches: [],
                success: false,
                error
              };
            }
          })
        );

        results.push(...batchResults);

        if (i + concurrency < embeddings.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      this.logger.info("Batch top k results", {
        totalQueries: queries.length,
        successfulQueries: results.filter(r => r.success).length,
        failedQueries: results.filter(r => !r.success).length
      });

      return results;
    }, {
      service: "VectorDbService",
      method: "batchTopK"
    })
  }
}
