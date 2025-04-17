import { ConverstionType, LLMOpts, Logger } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { BaseErrorHandler } from "../errorHandler/baseErrorHandler";
import { z, ZodObject } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import env from "@/config/env.config";
type ZodToType<T extends ZodObject<any, any, any>> = z.infer<T>;
export default class LLMService {
  private logger: Logger;
  private errorHandler: CentralErrorHandler;
  private static instance: LLMService | null;
  private constructor(logger: Logger, customErrorAdapter: BaseErrorHandler) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
    this.errorHandler.registerHandler(customErrorAdapter);
  }
  public static getInstance(logger: Logger, customErrorAdapter: BaseErrorHandler) {
    if (!this.instance) {
      this.instance = new LLMService(logger, customErrorAdapter);
    }
    return this.instance
  }
  async structuredRespose<T extends ZodObject<any, any, any>>(input: string | ConverstionType, structure: T, opts: LLMOpts): Promise<ZodToType<T>> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Invoking structured response", { input, structure, opts });
      const model = this.getModel(opts)
      const structuredLlm = model.withStructuredOutput(structure);
      const response = await structuredLlm.invoke(input);
      this.logger.info("response from llm", { input, response });
      return response;
    }, {
      service: "LLMService",
      method: "structuredRespose"
    });
  }
  private getModel(opts: LLMOpts) {
    switch (opts.provider) {
      case "openai":
        return new ChatOpenAI({
          openAIApiKey: env.OPENAI_API_KEY,
          modelName: opts.model,
          temperature: opts.temperature
        })
      case "gemini":
        return new ChatGoogleGenerativeAI({
          temperature: opts.temperature,
          apiKey: env.GEMINI_API_KEY,
          model: opts.model
        })
    }
  }
}
