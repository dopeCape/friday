import { Logger } from "@/types";
import Redis from "ioredis"
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import env from "@/config/env.config";

export default class RedisService {
  private static instance: RedisService | null;
  private logger: Logger;
  private errorHandler: CentralErrorHandler;
  private client = new Redis(env.REDIS_HOST)
  private constructor(logger: Logger) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
  }
  public static getInstance(logger: Logger) {
    if (!this.instance) {
      this.instance = new RedisService(logger);
    }
    return this.instance;
  }

  public async get(key: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("getting key from kv store", { key });
      const value = await this.client.get(key);
      return value;
    }, {
      method: "getVideo",
      service: "VideoService"
    });
  }

  public async set(key: string, value: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("setting key in kv store", { key, value });
      await this.client.set(key, value);
    }, {
      method: "getVideo",
      service: "VideoService"
    });
  }

}
