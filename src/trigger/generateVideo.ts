import { getDefaultVideoService, getDefaultRealtimeService, getDefaultLogger } from "@/config/defaults";
import { task } from "@trigger.dev/sdk/v3";

type Payload = {
  userQuery: string;
  generationId: string;
}

export const generateVideo = task({
  id: "generate-video",
  maxDuration: 300,
  retry: {
    maxAttempts: 2
  },
  machine: "medium-2x",
  run: async ({ userQuery, generationId }: Payload) => {
    const videoService = getDefaultVideoService();
    const realtimeService = getDefaultRealtimeService();
    const logger = getDefaultLogger();
    logger.info("Starting video generation", { userQuery, generationId });
    try {
      await realtimeService.pushToClient(
        generationId,
        "video-generation-status",
        { status: "processing" }
      );
      const videoUrl = await videoService.getVideo(userQuery, {});
      await realtimeService.pushToClient(
        generationId,
        "VIDEO_READY",
        { videoUrl: videoUrl.url }
      );
      logger.info("Video generated successfully", { videoUrl, generationId });
    } catch (error) {
      logger.error("Failed to generate video", { error, generationId });
      await realtimeService.pushToClient(
        generationId,
        "video-generation-status",
        { status: "error", error: error.message }
      );
      throw error;
    }
  },
});
