import { Logger } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
interface HLSConversionOptions {
  inputPath: string;
  outputDir: string;
  playlistName: string;
  segmentDuration?: number;
  segmentPrefix?: string;
  videoCodec?: string;
  audioCodec?: string;
  videoBitrate?: string;
  audioBitrate?: string;
  resolution?: string;
  hlsFlags?: string[];
}

interface VideoCreationOptions {
  imagePath: string;
  audioPath: string;
  outputPath: string;
  videoCodec?: string;
  audioCodec?: string;
  videoBitrate?: string;
  audioBitrate?: string;
}

interface VideoStitchingOptions {
  videoPaths: string[];
  outputPath: string;
  videoCodec?: string;
  audioCodec?: string;
  videoBitrate?: string;
  audioBitrate?: string;
  resolution?: string; // e.g., '1920x1080'
}

export default class FFMPEGService {
  private static instance: FFMPEGService | null = null;
  private logger: Logger;
  private errorHandler: CentralErrorHandler;

  private constructor(logger: Logger) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
  }

  static getInstance(logger: Logger): FFMPEGService {
    if (!FFMPEGService.instance) {
      FFMPEGService.instance = new FFMPEGService(logger);
    }
    return FFMPEGService.instance;
  }

  /**
   * Creates a video from a single image and audio file
   * The video duration will match the audio duration
   * @param options Configuration options for video creation
   * @returns Promise that resolves with the output path when video is created
   */
  async createVideoFromImage(options: VideoCreationOptions): Promise<string> {
    const {
      imagePath,
      audioPath,
      outputPath,
      videoCodec = 'libx264',
      audioCodec = 'aac',
      videoBitrate = '1000k',
      audioBitrate = '128k'
    } = options;

    try {
      this.logger.info('Starting video creation from image and audio', {
        imagePath,
        audioPath,
        outputPath
      });

      // Validate input files
      await this.validateInputFiles(imagePath, audioPath);

      // Ensure output directory exists
      await this.ensureOutputDirectory(outputPath);

      // Get audio duration for logging
      const duration = await this.getAudioDuration(audioPath);
      this.logger.info(`Audio duration: ${duration} seconds`);

      // Create the video
      const result = await this.executeFFmpegCommand({
        imagePath,
        audioPath,
        outputPath,
        videoCodec,
        audioCodec,
        videoBitrate,
        audioBitrate
      });

      this.logger.info('Video creation completed successfully', {
        outputPath,
        duration
      });

      return result;

    } catch (error) {
      const handledError = this.errorHandler.handleError(error, {
        context: 'FFMPEGService.createVideoFromImage',
        metadata: { imagePath, audioPath, outputPath }
      });
      throw handledError;
    }
  }

  /**
   * Stitches multiple videos together using simple concatenation
   * @param options Configuration options for video stitching
   * @returns Promise that resolves with the output path when stitching is complete
   */
  async stitchVideos(options: VideoStitchingOptions): Promise<string> {
    const {
      videoPaths,
      outputPath,
      videoCodec = 'libx264',
      audioCodec = 'aac',
      videoBitrate = '2000k',
      audioBitrate = '128k',
      resolution
    } = options;

    try {
      this.logger.info('Starting video stitching process', {
        videoCount: videoPaths.length,
        outputPath,
        resolution
      });

      // Validate inputs
      if (videoPaths.length < 1) {
        throw new Error('At least 1 video is required for stitching');
      }

      await this.validateVideoFiles(videoPaths);
      await this.ensureOutputDirectory(outputPath);

      // Get video information for logging
      const videoInfos = await Promise.all(
        videoPaths.map(async (videoPath, index) => {
          try {
            const info = await this.getMediaInfo(videoPath);
            return { index, path: videoPath, info };
          } catch (error) {
            this.logger.warn(`Could not get info for video ${index}: ${videoPath}`, { error });
            return { index, path: videoPath, info: null };
          }
        })
      );

      this.logger.info('Video information gathered', {
        videos: videoInfos.map(({ index, path, info }) => ({
          index,
          path,
          duration: info?.format?.duration || 'unknown',
          hasVideo: info?.streams?.some(s => s.codec_type === 'video') || false,
          hasAudio: info?.streams?.some(s => s.codec_type === 'audio') || false
        }))
      });

      // Execute stitching
      const result = await this.executeVideoStitching({
        videoPaths,
        outputPath,
        videoCodec,
        audioCodec,
        videoBitrate,
        audioBitrate,
        resolution
      });

      this.logger.info('Video stitching completed successfully', {
        outputPath,
        totalVideos: videoPaths.length
      });

      return result;

    } catch (error) {
      const handledError = this.errorHandler.handleError(error, {
        context: 'FFMPEGService.stitchVideos',
        metadata: { videoPaths, outputPath }
      });
      throw handledError;
    }
  }

  /**
   * Validates that input files exist and are accessible
   */
  private async validateInputFiles(imagePath: string, audioPath: string): Promise<void> {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`);
    }

    // Check file permissions
    try {
      await fs.promises.access(imagePath, fs.constants.R_OK);
      await fs.promises.access(audioPath, fs.constants.R_OK);
    } catch (error) {
      throw new Error(`Cannot read input files: ${error}`);
    }
  }

  /**
   * Validates that video files exist and are accessible
   */
  private async validateVideoFiles(videoPaths: string[]): Promise<void> {
    for (const videoPath of videoPaths) {
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`);
      }

      try {
        await fs.promises.access(videoPath, fs.constants.R_OK);
      } catch (error) {
        throw new Error(`Cannot read video file: ${videoPath}`);
      }
    }
  }

  /**
   * Ensures the output directory exists
   */
  private async ensureOutputDirectory(outputPath: string): Promise<void> {
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      try {
        await fs.promises.mkdir(outputDir, { recursive: true });
        this.logger.info(`Created output directory: ${outputDir}`);
      } catch (error) {
        throw new Error(`Failed to create output directory: ${outputDir}`);
      }
    }
  }

  /**
   * Gets the duration of an audio file
   */
  private async getAudioDuration(audioPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          reject(new Error(`Failed to get audio duration: ${err.message}`));
          return;
        }

        const duration = metadata.format.duration;
        if (duration) {
          resolve(duration);
        } else {
          reject(new Error('Could not determine audio duration'));
        }
      });
    });
  }

  /**
   * Executes the FFmpeg command to create the video
   */
  private async executeFFmpegCommand(options: VideoCreationOptions): Promise<string> {
    const {
      imagePath,
      audioPath,
      outputPath,
      videoCodec,
      audioCodec,
      videoBitrate,
      audioBitrate
    } = options;

    // Get audio duration to explicitly set video duration
    const audioDuration = await this.getAudioDuration(audioPath);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(imagePath)
        .inputOptions([
          '-loop 1',      // Loop the image
          '-framerate 1'  // Set low framerate since it's a static image
        ])
        .input(audioPath)
        .videoCodec(videoCodec!)
        .audioCodec(audioCodec!)
        .videoBitrate(videoBitrate!)
        .audioBitrate(audioBitrate!)
        .outputOptions([
          `-t ${audioDuration}`,  // Explicitly set duration to match audio
          '-pix_fmt yuv420p',     // Ensure compatibility
          '-map 0:v:0',           // Map first video stream (image)
          '-map 1:a:0'            // Map first audio stream (audio file)
        ])
        .output(outputPath)
        .on('start', (commandLine) => {
          this.logger.info('FFmpeg process started', { commandLine });
        })
        .on('progress', (progress) => {
          const percent = Math.round(progress.percent || 0);
          this.logger.debug(`Video creation progress: ${percent}%`);
        })
        .on('end', () => {
          this.logger.info('FFmpeg process completed successfully');
          resolve(outputPath);
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error('FFmpeg process failed', {
            error: err.message,
            stderr,
            stdout
          });
          reject(new Error(`FFmpeg failed: ${err.message}`));
        })
        .run();
    });
  }

  /**
   * Executes the FFmpeg command for video stitching (simplified without transitions)
   */
  private async executeVideoStitching(options: VideoStitchingOptions): Promise<string> {
    const {
      videoPaths,
      outputPath,
      videoCodec,
      audioCodec,
      videoBitrate,
      audioBitrate,
      resolution
    } = options;

    return new Promise((resolve, reject) => {
      const ffmpegCommand = ffmpeg();

      // Add all video inputs
      videoPaths.forEach(videoPath => {
        ffmpegCommand.input(videoPath);
      });

      // Build filter complex for concatenation
      let filterComplex: string;

      if (resolution) {
        // Scale all videos to the same resolution, then concatenate
        const scaleFilters = videoPaths.map((_, index) => `[${index}:v]scale=${resolution}[v${index}]`);
        const concatInputs = videoPaths.map((_, index) => `[v${index}][${index}:a]`).join('');
        filterComplex = `${scaleFilters.join(';')};${concatInputs}concat=n=${videoPaths.length}:v=1:a=1[outv][outa]`;
      } else {
        // Simple concatenation without scaling
        const concatInputs = videoPaths.map((_, index) => `[${index}:v][${index}:a]`).join('');
        filterComplex = `${concatInputs}concat=n=${videoPaths.length}:v=1:a=1[outv][outa]`;
      }

      this.logger.debug('Filter complex for stitching:', { filterComplex });

      ffmpegCommand
        .complexFilter(filterComplex)
        .outputOptions([
          '-map [outv]',      // Map concatenated video
          '-map [outa]',      // Map concatenated audio
          '-pix_fmt yuv420p'  // Ensure compatibility
        ])
        .videoCodec(videoCodec!)
        .audioCodec(audioCodec!)
        .videoBitrate(videoBitrate!)
        .audioBitrate(audioBitrate!)
        .output(outputPath)
        .on('start', (commandLine) => {
          this.logger.info('FFmpeg stitching process started', { commandLine });
        })
        .on('progress', (progress) => {
          const percent = Math.round(progress.percent || 0);
          this.logger.debug(`Video stitching progress: ${percent}%`);
        })
        .on('end', () => {
          this.logger.info('FFmpeg stitching process completed successfully');
          resolve(outputPath);
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error('FFmpeg stitching process failed', {
            error: err.message,
            stderr,
            stdout,
            filterComplex
          });
          reject(new Error(`FFmpeg stitching failed: ${err.message}`));
        })
        .run();
    });
  }


  /**
   * Converts an MP4 video to HLS format with segmented chunks
   * Creates a master playlist (.m3u8) and segment files (.ts)
   * @param options Configuration options for HLS conversion
   * @returns Promise that resolves with the playlist path when conversion is complete
   */
  async convertToHLS(options: HLSConversionOptions): Promise<string> {
    const {
      inputPath,
      outputDir,
      playlistName = 'playlist.m3u8',
      segmentDuration = 10,
      segmentPrefix = 'segment',
      videoCodec = 'libx264',
      audioCodec = 'aac',
      videoBitrate = '2000k',
      audioBitrate = '128k',
      resolution,
      hlsFlags = ['hls_time', 'hls_playlist_type=vod', 'hls_segment_filename']
    } = options;

    const playlistPath = path.join(outputDir, playlistName);
    const segmentPattern = path.join(outputDir, `${segmentPrefix}_%03d.ts`);

    try {
      this.logger.info('Starting MP4 to HLS conversion', {
        inputPath,
        outputDir,
        playlistPath,
        segmentDuration,
        segmentPrefix
      });

      // Validate input file
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Input MP4 file not found: ${inputPath}`);
      }

      try {
        await fs.promises.access(inputPath, fs.constants.R_OK);
      } catch (error) {
        throw new Error(`Cannot read input file: ${inputPath}`);
      }

      await this.ensureOutputDirectory(playlistPath);

      // Get input video information for logging
      let inputInfo;
      try {
        inputInfo = await this.getMediaInfo(inputPath);
        this.logger.info('Input video information', {
          duration: inputInfo.format?.duration || 'unknown',
          size: inputInfo.format?.size || 'unknown',
          videoStreams: inputInfo.streams?.filter(s => s.codec_type === 'video').length || 0,
          audioStreams: inputInfo.streams?.filter(s => s.codec_type === 'audio').length || 0
        });
      } catch (error) {
        this.logger.warn('Could not get input video info', { error: error.message });
      }

      // Calculate estimated number of segments
      const estimatedDuration = inputInfo?.format?.duration || 0;
      const estimatedSegments = Math.ceil(estimatedDuration / segmentDuration);
      this.logger.info(`Estimated ${estimatedSegments} segments of ${segmentDuration}s each`);

      // Execute HLS conversion
      const result = await this.executeHLSConversion({
        inputPath,
        playlistPath,
        segmentPattern,
        segmentDuration,
        videoCodec,
        audioCodec,
        videoBitrate,
        audioBitrate,
        resolution,
        hlsFlags
      });

      // Verify output files were created
      if (!fs.existsSync(playlistPath)) {
        throw new Error('HLS playlist was not created');
      }

      // Count actual segments created
      const segmentFiles = fs.readdirSync(outputDir)
        .filter(file => file.startsWith(segmentPrefix) && file.endsWith('.ts'));

      this.logger.info('HLS conversion completed successfully', {
        playlistPath,
        segmentsCreated: segmentFiles.length,
        estimatedSegments,
        outputDir
      });

      return playlistPath;

    } catch (error) {
      const handledError = this.errorHandler.handleError(error, {
        context: 'FFMPEGService.convertToHLS',
        metadata: { inputPath, outputDir, playlistPath }
      });
      throw handledError;
    }
  }

  /**
   * Executes the FFmpeg command for HLS conversion
   */
  private async executeHLSConversion(options: {
    inputPath: string;
    playlistPath: string;
    segmentPattern: string;
    segmentDuration: number;
    videoCodec: string;
    audioCodec: string;
    videoBitrate: string;
    audioBitrate: string;
    resolution?: string;
    hlsFlags: string[];
  }): Promise<string> {
    const {
      inputPath,
      playlistPath,
      segmentPattern,
      segmentDuration,
      videoCodec,
      audioCodec,
      videoBitrate,
      audioBitrate,
      resolution,
      hlsFlags
    } = options;

    return new Promise((resolve, reject) => {
      const ffmpegCommand = ffmpeg()
        .input(inputPath)
        .videoCodec(videoCodec)
        .audioCodec(audioCodec)
        .videoBitrate(videoBitrate)
        .audioBitrate(audioBitrate);

      // Add resolution scaling if specified
      if (resolution) {
        ffmpegCommand.size(resolution);
      }

      // Configure HLS-specific options
      const outputOptions = [
        '-f hls',                                    // Force HLS format
        `-hls_time ${segmentDuration}`,             // Segment duration
        `-hls_segment_filename ${segmentPattern}`,   // Segment file pattern
        '-hls_playlist_type vod',                   // Video on demand playlist
        '-pix_fmt yuv420p',                         // Ensure compatibility
        '-preset fast',                             // Encoding speed vs quality
        '-movflags +faststart'                      // Optimize for streaming
      ];

      // Add any additional HLS flags
      hlsFlags.forEach(flag => {
        if (!outputOptions.some(opt => opt.includes(flag.split('=')[0]))) {
          outputOptions.push(`-${flag}`);
        }
      });

      ffmpegCommand
        .outputOptions(outputOptions)
        .output(playlistPath)
        .on('start', (commandLine) => {
          this.logger.info('FFmpeg HLS conversion started', { commandLine });
        })
        .on('progress', (progress) => {
          const percent = Math.round(progress.percent || 0);
          const timemarkSeconds = this.parseTimemark(progress.timemark);
          this.logger.debug(`HLS conversion progress: ${percent}% (${progress.timemark})`);
        })
        .on('end', () => {
          this.logger.info('FFmpeg HLS conversion completed successfully');
          resolve(playlistPath);
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error('FFmpeg HLS conversion failed', {
            error: err.message,
            stderr,
            stdout
          });
          reject(new Error(`FFmpeg HLS conversion failed: ${err.message}`));
        })
        .run();
    });
  }

  /**
   * Helper method to parse FFmpeg timemark into seconds
   */
  private parseTimemark(timemark: string): number {
    if (!timemark) return 0;

    const parts = timemark.split(':');
    if (parts.length !== 3) return 0;

    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Gets information about a media file
   * Useful for validation and debugging
   */
  async getMediaInfo(filePath: string): Promise<any> {
    try {
      this.logger.debug(`Getting media info for: ${filePath}`);

      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
          if (err) {
            reject(new Error(`Failed to get media info: ${err.message}`));
            return;
          }
          resolve(metadata);
        });
      });
    } catch (error) {
      const handledError = this.errorHandler.handleError(error, {
        context: 'FFMPEGService.getMediaInfo',
        metadata: { filePath }
      });
      throw handledError;
    }
  }
}
