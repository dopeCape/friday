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
import { v4 } from "uuid";
import RedisService from "./redis.service";
import ScreenshotService from "./screenshot.service";
import FFMPEGService from "./ffmpeg.service";
import MemeProvider from "../providers/meme.provider";
import BlobService from "./blob.service";
import FileService from "./file.service";


export default class VideoService {
  private static instance: VideoService | null;
  private logger: Logger;
  private errorHandler: CentralErrorHandler;
  private vectorDb: VectorDbService;
  private renderPagePath = "sxzy";
  private llmService: LLMService;
  private ttsService: TTSService;
  private blobService: BlobService;
  private screenShotService: ScreenshotService;
  private ouptputFixedPath = "output.mp4";
  private redisService: RedisService;
  private ffmpegService: FFMPEGService;
  private memeProvider: MemeProvider
  private fileService: FileService
  private tempDir = env.TEMP_PATH
  private TOP_K = 4;
  private VIDEO_STORE_OPTS = {
    index: env.VIDEO_PINEONE_INDEX,
    model: env.DEFAULT_EMBEDDING_MODEL,
  }
  private constructor(
    logger: Logger,
    vectorDb: VectorDbService,
    llmService: LLMService,
    ttsService: TTSService,
    redisService: RedisService,
    screenShotService: ScreenshotService,
    ffmpegService: FFMPEGService,
    memeProvider: MemeProvider,
    blobService: BlobService,
    fileService: FileService
  ) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
    this.llmService = llmService
    this.vectorDb = vectorDb;
    this.ttsService = ttsService;
    this.redisService = redisService;
    this.screenShotService = screenShotService;
    this.ffmpegService = ffmpegService
    this.memeProvider = memeProvider
    this.blobService = blobService;
    this.fileService = fileService
  }
  public static getInstance(
    logger: Logger,
    vectorDb: VectorDbService,
    llmService: LLMService,
    ttsService: TTSService,
    redisService: RedisService,
    screenShotService: ScreenshotService,
    ffmpegService: FFMPEGService,
    memeProvider: MemeProvider,
    blobService: BlobService,
    fileService: FileService
  ) {
    if (!this.instance) {
      this.instance = new VideoService(logger, vectorDb, llmService, ttsService, redisService, screenShotService, ffmpegService, memeProvider, blobService, fileService);
    }
    return this.instance;
  }

  public async getVideo(query: string, opts: VideoOpts) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Getting video from vector store", { query, opts })

      const results = await this.vectorDb.topK(query, this.TOP_K, { ...this.VIDEO_STORE_OPTS, includeMetadata: true });

      const videoDataFromDb = results.map(result => ({
        title: result.metadata.title,
        videoId: result.id,
        videoUrl: result.metadata.url,
        description: result.metadata.description
      }));

      const relevantVideo = await this.selectMostRelevantVideo(query, opts, videoDataFromDb);
      if (relevantVideo) {
        return {
          url: relevantVideo.videoUrl,
        };
      }
      const videoData = await this.generateVideo(query, opts);
      return {
        url: videoData
      }
    }, {
      method: "getVideo",
      service: "VideoService"
    });
  }
  //TODO:add metadata type to video data.
  private getValidationPrompt(query: string, opts: VideoOpts, videoData: { title: string, videoId: string, videoUrl: string, description: string }[]) {
    return `${PromptProvider.getVideoValidatorPrompt()}

<input_data>
  <user_query>${query}</user_query>
  <user_config>
    ${Object.entries(opts).map(([key, value]) =>
      `<requirement>
        <type>${key}</type>
        <value>${value}</value>
      </requirement>`
    ).join('\n    ')}
  </user_config>
  
  <video_list>
    ${videoData.map(video =>
      `<video>
        <id>${video.videoId}</id>
        <title>${video.title}</title>
        <url>${video.videoUrl}</url>
        <description>${video.description}</description>
      </video>`
    ).join('\n    ')}
  </video_list>
</input_data>`
  }

  private getVideoScriptGenerationPrompt(query: string, lang?: string) {
    return [new SystemMessage(PromptProvider.getVideoScriptPrompt()), new HumanMessage(`Video topic:${query}, programing language specified:${lang}`)]
  }

  private storeToVectorDB(videoId: string, videoTitle: string, videoDescription: string, videoUrl: string, language?: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Storing video to vector store", { videoId, videoTitle, videoDescription, videoUrl });
      await this.vectorDb.save(videoDescription, videoId, {
        title: videoTitle,
        url: videoUrl,
        language,
        description: videoDescription
      }, {
        ...this.VIDEO_STORE_OPTS
      });
    }, {
      service: "VideoService",
      method: "storeToVectorDB"
    })
  }

  public async generateVideo(query: string, opts: VideoOpts) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("generating video for query ", { query, opts });
      // generate video id.
      const videoId = v4();
      // get script.
      const scriptData = await this.generateVideoScript(query, opts.lang);
      // then in parrerl generate slide and audio.
      const slidesAndAudio = await this.generateAudioAndSlides(query, scriptData.scripts, videoId);
      // stitch up slide and audio.
      const videoChunks = await this.stichUpImgaeToAudios(slidesAndAudio, videoId);
      const directoryPath = `${this.tempDir}/${videoId}/`;
      // stitch up all the video chunks together.
      await this.ffmpegService.stitchVideos({
        videoPaths: videoChunks,
        outputPath: `${directoryPath}${this.ouptputFixedPath}`
      });
      const hlsData = await this.convertToHls(videoId);
      // upload to bucket.
      await this.pushToBlob(hlsData.dirPath, videoId);
      const playlistPath = `${env.BUCKET_URI}/${env.BUCKET_NAME}/${videoId}/playlist.m3u8`
      // save to vector store.
      await this.storeToVectorDB(videoId, scriptData.title, scriptData.description, playlistPath, opts.lang);
      // clean up the video directory.
      await this.fileService.cleanUp(directoryPath);
      return playlistPath;
    }, {
      service: "VideoService",
      method: "generateVideo"
    })
  }
  private async pushToBlob(path: string, videoId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("pushing video to blob", { path, videoId });
      const bucketName = env.BUCKET_NAME;
      return this.blobService.uploadFolder(path, bucketName, videoId);
    }, {
      service: "VideoService",
      method: "pushToBlob"

    })

  }

  private async generateAudioAndSlides(query: string, scripts: string[], videoId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Generative audio and slides for query", { query, scripts });
      const slidesAndAudioMap = new Map<number, { audio: string, slide: string }>();
      await Promise.all(scripts.map(async (script, index) => {
        const [slide, audio] = await Promise.all([
          await this.generateSlide(query, scripts, index, videoId),
          await this.generateVoiceover(script, videoId),
        ]);
        slidesAndAudioMap.set(index, { audio, slide });
      }));
      this.logger.info("Generated audio and slides for query ", { query, slidesAndAudioMap });
      return Array.from({ length: scripts.length }, (_, index) => slidesAndAudioMap.get(index));
    }, {
      service: "VideoService",
      method: "generateAudioAndScript"
    })
  }

  public async generateVideoScript(query: string, lang?: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Generating script for provide query ", { query });
      const response = await this.llmService.structuredResponseWithFallback(this.getVideoScriptGenerationPrompt(query, lang), videoScriptGenerationSchema, {
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

  private async selectMostRelevantVideo(query: string, opts: VideoOpts, videoData: any[]): Promise<{ videoId: string; videoUrl: string; reason: string } | null> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Selecting most relevant video for query")

      const schema = z.object({
        video_id: z.string().describe("Selected video ID or NONE if no video is relevant, very important to return NONE if no video is relevant"),
        video_url: z.string().describe("Selected video URL or empty string if no video is relevant"),
        reason: z.string().describe("Brief explanation of why this video was selected or why none were suitable")
      })

      const prompt = this.getValidationPrompt(query, opts, videoData);
      const response = await this.llmService.structuredResponse(prompt, schema, {
        model: "gpt-4.1-mini",
        provider: "openai"
      })

      this.logger.info(`Video selection result\nQuery: ${query}\nSelected: ${response.parsed.video_id}\nURL: ${response.parsed.video_url}\nReason: ${response.parsed.reason}`, {
        query,
        selectedVideoId: response.parsed.video_id,
        selectedVideoUrl: response.parsed.video_url,
        reason: response.parsed.reason,
        totalVideos: videoData.length
      })

      if (response.parsed.video_id === "NONE") {
        return null;
      }

      return {
        videoId: response.parsed.video_id,
        videoUrl: response.parsed.video_url,
        reason: response.parsed.reason
      };
    }, {
      method: "selectMostRelevantVideo",
      service: "VideoService"
    })
  }
  public async generateVoiceover(script: string, videoId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Generating voiceover for", {
        script,
      });
      const savedFile = await this.ttsService.generateTTS(script, videoId, {
        model: "gpt-4o-mini-tts",
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

  private getRenderUrl(slideId: string) {
    return `${env.APP_URL}/${this.renderPagePath}/${slideId}`;
  }

  public async generateSlide(query: string, narrations: string[], currentIndex: number, videoId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Generating slide for nurration", { query, narrations, currentIndex });
      const prompt = this.getSlideGenrationPrompt(query, narrations, currentIndex);
      let slideData: any = { template: "" }
      while (slideData.template === "") {
        slideData = await this.llmService.structuredResponse(prompt, videoSlideGenerationDataSchema as unknown as Record<string, string>, {
          model: "o3",
          provider: "openai",
        });
      }
      const slideId = v4();
      const slideDataWithMeme = await this.attachMeme(slideData.parsed);
      await this.redisService.set(slideId, JSON.stringify(slideDataWithMeme));
      const slideUrl = this.getRenderUrl(slideId);
      const slidePath = await this.screenShotService.takeScreenshot(slideUrl, videoId);
      return slidePath;
    }, {
      service: "VideoService",
      method: "generateSlide",
    })
  }
  private async attachMeme(slideData: any) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Checking for meme in slide data", { slideData });
      const hasMeme = slideData?.props?.supportingVisual?.type === "meme";
      if (!hasMeme) {
        return slideData;
      }
      this.logger.info("Generating meme for query ", { query: slideData?.props?.supportingVisual?.query });
      const memeUrl = await this.memeProvider.generateMeme(slideData?.props?.supportingVisual?.query);
      slideData.props.supportingVisual = { ...slideData?.props?.supportingVisual, url: memeUrl };
      this.logger.info("Attached meme to slide data ", { slideData });
      return slideData;
    }, {
      service: "VideoService",
      method: "attachMeme"
    })

  }
  private async convertToHls(videoId: string) {
    return this.errorHandler.handleError(async () => {
      const outputPath = `${this.tempDir}/${videoId}/hls`;
      const videoPath = `${this.tempDir}/${videoId}/${this.ouptputFixedPath}`
      const hlsPath = await this.ffmpegService.convertToHLS({
        inputPath: videoPath,
        outputDir: outputPath,
        playlistName: `playlist.m3u8`

      });
      return { dirPath: outputPath, videoUrl: hlsPath };
    }, {
      service: "VideoService",
      method: "convertToHls"
    })
  }
  private async stichUpImgaeToAudios(slideData: { slide: string, audio: string }[], videoId: string) {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Stiching up image to audio", { slideData });
      const videoChunks = await Promise.all(slideData.map(async ({ slide: slidePath, audio: audioPath }) => await this.ffmpegService.createVideoFromImage({
        imagePath: slidePath,
        audioPath: audioPath,
        outputPath: `${this.tempDir}/${videoId}/vidoes/${v4()}.mp4`
      })));
      return videoChunks;
    }, {
      service: "VideoService",
      method: "stichUpImgaeToAudios"
    })
  }
}
