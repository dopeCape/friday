import { Logger } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import VectorDbService from "./vectorDb.service";
import { VideoOpts } from "@/types";
import env from "@/config/env.config";
import LLMService from "./llm.service";
import { z } from "zod";
import { PromptProvider } from "../providers/prompt.provider";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { videoScriptGenerationSchema, videoSlideGenerationDataSchema } from "../schemas";
import TTSService from "./tts.service";

// Get video from vector store -- done
// rank if -- done 
// generate if not found
//  - generate script in chunk. -- done
//  - generate a uuid for video use that as dir name, inside that create audios , vidoes and outputs
//  - generate slide + generate voice (//)
//  - stitch audio to slid
//  - stick all the slides together  
//
// save to vector store

export default class VideoService {
  private static instance: VideoService | null;
  private logger: Logger;
  private errorHandler: CentralErrorHandler;
  private vectorDb: VectorDbService;
  private llmService: LLMService;
  private ttsService: TTSService;
  private TOP_K = 4;
  private VIDEO_STORE_OPTS = {
    index: env.VIDEO_PINEONE_INDEX,
    model: env.DEFAULT_EMBEDDING_MODEL,
  }
  private constructor(logger: Logger, vectorDb: VectorDbService, llmService: LLMService, ttsService: TTSService) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
    this.llmService = llmService
    this.vectorDb = vectorDb;
    this.ttsService = ttsService;
  }
  public static getInstance(logger: Logger, vectorDb: VectorDbService, llmService: LLMService, ttsService: TTSService) {
    if (!this.instance) {
      this.instance = new VideoService(logger, vectorDb, llmService, ttsService);
    }
    return this.instance;
  }

  public async getVideo(query: string, opts: VideoOpts) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting video from vector store", { query, opts })
      const results = await this.vectorDb.topK(query, this.TOP_K, { ...this.VIDEO_STORE_OPTS, includeMetadata: true });
      const videoFromDb = results[0].metadata
      const isValidVideo = await this.checkIfVideoIsValidForQuery(query, videoFromDb);
      if (isValidVideo) {
        return {
          title: videoFromDb.title,
          url: videoFromDb.url
        };
      }
    }, {
      method: "getVideo",
      service: "VideoService"
    });
  }
  //TODO:add metadata type to video data.
  private getValidationPrompt(query: string, videoData: any) {
    return `${PromptProvider.getVideoValidatorPrompt()}
# Query: ${query}
# Video data: ${Object.keys(videoData).map((key) => {
      return `${key}:${videoData[key]}\n`
    })}
`
  }
  private getVideoScriptGenerationPrompt(query: string) {
    return [new SystemMessage(PromptProvider.getVideoScriptPrompt()), new HumanMessage(`Video topic:${query}`)]
  }



  public async generateVideo(query: string, opts: VideoOpts) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("generating video for query ", { query, opts });
      // generate video id.
      // get script.
      // then in parrerl generate slide and audio.
      // stitch up slide and audio.
      // stitch up all the video chunks together.
      // convert to hls.
      // upload to r2.
      // save to vector store.
      // clean up the video directory.
    }, {
      service: "VideoService",
      method: "generateVideo"

    })
  }

  public async generateVideoScript(query: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Generating script for provide query ", { query });
      const response = await this.llmService.structuredResponseWithFallback(this.getVideoScriptGenerationPrompt(query), videoScriptGenerationSchema, {
        model: "o3",
        provider: "openai"
      })
      this.logger.info("Generated script for video", { ...response.parsed });
      return response.parsed
    }, {
      service: "VideoService",
      method: "generateVideoScript"
    })
  }

  private async checkIfVideoIsValidForQuery(query: string, videoData: any): Promise<boolean> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Checking if video is valid for query")
      const schema = z.object({
        reason: z.string().describe("Reason of why this video is valid for the query"),
        is_valid: z.boolean().describe("Is this video valid for the query")
      })
      const prompt = this.getValidationPrompt(query, videoData);
      const response = await this.llmService.structuredResponse(prompt, schema, {
        model: "gpt-4.1-mini",
        provider: "openai"
      })
      this.logger.info(`Verdict from llm \n query :${query}, isValid:${response.parsed.is_valid}, reason:${response.parsed.reason}`, { ...response.parsed })
      return response.parsed.is_valid;
    }, {
      method: "checkIfVideoIsValidForQuery",
      service: "VideoService"
    })
  }
  public async generateVoiceover(script: string, videoId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Generating voiceover for", {
        script,
      });
      const savedFile = await this.ttsService.generateTTS(script, videoId, {
        model: "tts-1",
        voice: "alloy"
      })
      return savedFile;
    }, {
      service: "VideoService",
      method: "generateVoiceover"
    })
  }
  private getSlideGenrationPrompt(query: string, narrations: string[], index: number) {
    const humanMessage = `
video generation Query: ${query},
previous nurrations:${narrations.slice(0, index).toString()},
next nurrations:${narrations.slice(index + 1, narrations.length).toString()},
current slide nurration: ${narrations[index]},
`
    return [new SystemMessage(PromptProvider.getVideoSlidePrompt()), new HumanMessage(humanMessage)];
  }
  public async generateSlide(query: string, narrations: string[], currentIndex: number) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Generating slide for nurration", { query, narrations, currentIndex });
      const prompt = this.getSlideGenrationPrompt(query, narrations, currentIndex);
      const slideData = await this.llmService.structuredResponse(prompt, videoSlideGenerationDataSchema as unknown as Record<string, string>, {
        model: "gpt-4.1-mini",
        provider: "openai",

      })
      return slideData.parsed;
    }, {
      service: "VideoService",
      method: "generateSlide",
    })
  }
}
