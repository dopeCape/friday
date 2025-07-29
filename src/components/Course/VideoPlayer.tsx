import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';

interface FridayVideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  onError?: (error: string) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  poster?: string;
  loop?: boolean;
  muted?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  crossOrigin?: 'anonymous' | 'use-credentials';
  startTime?: number;
  enableKeyboardShortcuts?: boolean;
  showPlaybackSpeed?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isBuffering: boolean;
  isInitialLoading: boolean;
  error: string;
  isVideoReady: boolean;
  showControls: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  retryCount: number;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const FridayVideoPlayer: React.FC<FridayVideoPlayerProps> = ({
  src,
  title = 'Video Demonstration',
  className = '',
  autoPlay = false,
  onError,
  onLoadStart,
  onLoadEnd,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  poster,
  loop = false,
  muted = false,
  preload = 'metadata',
  crossOrigin,
  startTime = 0,
  enableKeyboardShortcuts = true,
  showPlaybackSpeed = true,
  maxRetries = 3,
  retryDelay = 1000,
}) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeUpdateRef = useRef(0);

  // Simplified state
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: muted,
    isBuffering: false,
    isInitialLoading: true,
    error: '',
    isVideoReady: false,
    showControls: true,
    isFullscreen: false,
    playbackRate: 1,
    retryCount: 0,
  });

  const [bufferedRanges, setBufferedRanges] = useState<TimeRanges | null>(null);
  const [seekFeedback, setSeekFeedback] = useState<{ direction: 'forward' | 'backward'; show: boolean }>({
    direction: 'forward',
    show: false
  });
  const [showSettings, setShowSettings] = useState(false);

  // Memoized calculations
  const bufferedPercentage = useMemo(() => {
    if (!bufferedRanges || !state.duration || bufferedRanges.length === 0) return 0;
    try {
      const buffered = bufferedRanges.end(bufferedRanges.length - 1);
      return Math.min((buffered / state.duration) * 100, 100);
    } catch {
      return 0;
    }
  }, [bufferedRanges, state.duration]);

  const progressPercentage = useMemo(() => {
    return state.duration ? (state.currentTime / state.duration) * 100 : 0;
  }, [state.currentTime, state.duration]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Error retry logic
  const retryConnection = useCallback(() => {
    if (state.retryCount >= maxRetries) {
      const errorMsg = `Failed to load video after ${maxRetries} attempts`;
      setState(prev => ({ ...prev, error: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));

    retryTimeoutRef.current = setTimeout(() => {
      if (hlsRef.current) {
        hlsRef.current.startLoad();
      } else if (videoRef.current) {
        videoRef.current.load();
      }
    }, retryDelay * Math.pow(2, state.retryCount));
  }, [state.retryCount, maxRetries, retryDelay, onError]);

  // Initialize HLS and video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setState(prev => ({
      ...prev,
      isInitialLoading: true,
      error: '',
      isVideoReady: false,
      retryCount: 0
    }));
    onLoadStart?.();

    // Event handlers
    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: video.duration,
        isVideoReady: true
      }));

      if (startTime && startTime > 0 && startTime < video.duration) {
        video.currentTime = startTime;
      }

      if (!hlsRef.current) {
        setState(prev => ({ ...prev, isInitialLoading: false }));
        onLoadEnd?.();
      }
    };

    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastTimeUpdateRef.current < 100) return;

      lastTimeUpdateRef.current = now;

      setState(prev => ({ ...prev, currentTime: video.currentTime }));
      onTimeUpdate?.(video.currentTime);

      // Update buffered ranges periodically
      if (Math.floor(video.currentTime) % 2 === 0) {
        setBufferedRanges(video.buffered);
      }
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true, isBuffering: false }));
      onPlay?.();
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      onPause?.();
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      onEnded?.();
    };

    const handleWaiting = () => setState(prev => ({ ...prev, isBuffering: true }));
    const handleCanPlay = () => {
      setState(prev => ({ ...prev, isBuffering: false, isInitialLoading: false }));
      if (!hlsRef.current) onLoadEnd?.();
    };

    const handleError = () => retryConnection();

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // HLS setup
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        startLevel: -1,
        debug: false,
        xhrSetup: (xhr: XMLHttpRequest) => {
          xhr.withCredentials = crossOrigin === 'use-credentials';
        },
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setState(prev => ({ ...prev, isInitialLoading: false, isVideoReady: true }));
        onLoadEnd?.();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              retryConnection();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              const errorMessage = 'Failed to load video';
              setState(prev => ({ ...prev, error: errorMessage }));
              onError?.(errorMessage);
          }
        }
      });
    } else {
      const errorMessage = 'HLS not supported in this browser';
      setState(prev => ({ ...prev, error: errorMessage, isInitialLoading: false }));
      onError?.(errorMessage);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, crossOrigin, onError, onLoadStart, onLoadEnd, onTimeUpdate, onPlay, onPause, onEnded, retryConnection, startTime, state.currentTime]);

  // Optimized seek function
  const seekVideo = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video || !state.isVideoReady || state.isInitialLoading) return;

    const newTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration));
    video.currentTime = newTime;

    setSeekFeedback({
      direction: seconds > 0 ? 'forward' : 'backward',
      show: true
    });

    setTimeout(() => setSeekFeedback(prev => ({ ...prev, show: false })), 800);
  }, [state.isVideoReady, state.isInitialLoading]);

  // Control functions
  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !state.isVideoReady) return;

    try {
      if (state.isPlaying) {
        video.pause();
      } else {
        await video.play();
      }
    } catch (error) {
      console.warn('Play/pause failed:', error);
    }
  }, [state.isPlaying, state.isVideoReady]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progress = progressRef.current;
    if (!video || !progress || !state.isVideoReady || !state.duration) return;

    const rect = progress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(clickX / rect.width, 1));
    const newTime = percentage * state.duration;

    video.currentTime = newTime;
    setState(prev => ({ ...prev, currentTime: newTime }));
  }, [state.isVideoReady, state.duration]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setState(prev => ({ ...prev, isMuted: video.muted }));
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setState(prev => ({ ...prev, volume: newVolume, isMuted: newVolume === 0 }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!state.isFullscreen) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [state.isFullscreen]);

  const handlePlaybackSpeedChange = useCallback((speed: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    setState(prev => ({ ...prev, playbackRate: speed }));
    setShowSettings(false);
  }, []);

  // Auto-hide controls
  const handleMouseMove = useCallback(() => {
    setState(prev => ({ ...prev, showControls: true }));

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (state.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, showControls: false }));
      }, 3000);
    }
  }, [state.isPlaying]);

  // Keyboard controls
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container || !state.isVideoReady || document.activeElement !== container) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          seekVideo(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekVideo(5);
          break;
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      container.setAttribute('tabindex', '0');
    }

    return () => {
      container?.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.isVideoReady, enableKeyboardShortcuts, seekVideo, togglePlay, toggleMute, toggleFullscreen]);

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  const formatTime = useCallback((time: number): string => {
    if (!isFinite(time) || isNaN(time)) return '0:00';

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  if (state.error) {
    return (
      <motion.div
        className={`relative bg-black/90 rounded-lg overflow-hidden ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="aspect-video flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="space-y-2">
              <h3 className="text-white font-medium">Video Error</h3>
              <p className="text-white/60 text-sm">{state.error}</p>
              {state.retryCount < maxRetries && (
                <button
                  onClick={retryConnection}
                  className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`relative group ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
        <div
          ref={containerRef}
          className="relative aspect-video focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setState(prev => ({ ...prev, showControls: true }))}
          onClick={() => containerRef.current?.focus()}
        >
          {/* Loading Overlay */}
          {state.isInitialLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="text-center space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                  <motion.div
                    className="absolute inset-0 border-4 border-transparent border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-white/80 font-medium">Loading Video</p>
                  <p className="text-white/50 text-sm">Please wait...</p>
                </div>
              </div>
            </div>
          )}

          {/* Buffering Indicator */}
          {state.isBuffering && !state.isInitialLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 pointer-events-none">
              <motion.div
                className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}

          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            onClick={togglePlay}
            autoPlay={autoPlay}
            loop={loop}
            muted={state.isMuted}
            playsInline
            preload={preload}
            crossOrigin={crossOrigin}
            poster={poster}
            aria-label={title}
          />

          {/* Seek Feedback */}
          <AnimatePresence>
            {seekFeedback.show && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-black/80 backdrop-blur-sm rounded-lg px-6 py-4 flex items-center gap-3">
                  <motion.div
                    initial={{ x: seekFeedback.direction === 'forward' ? -10 : 10 }}
                    animate={{ x: 0 }}
                  >
                    {seekFeedback.direction === 'forward' ? (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                      </svg>
                    )}
                  </motion.div>
                  <span className="text-white text-lg font-medium">
                    {seekFeedback.direction === 'forward' ? '+5s' : '-5s'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls Overlay */}
          <AnimatePresence>
            {state.showControls && !state.isInitialLoading && state.isVideoReady && (
              <motion.div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Progress Bar */}
                <div className="px-4 pb-2">
                  <div
                    ref={progressRef}
                    className="relative h-1 bg-white/20 rounded-full cursor-pointer group/progress"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
                      style={{ width: `${bufferedPercentage}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all group-hover/progress:h-1.5"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="px-4 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className="p-2 text-white hover:text-blue-400 transition-colors"
                    >
                      {state.isPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    {/* Volume Controls - Fixed alignment */}
                    <div className="flex items-center gap-2 group/volume">
                      <button
                        onClick={toggleMute}
                        className="p-2 text-white hover:text-blue-400 transition-colors"
                      >
                        {state.isMuted || state.volume === 0 ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                          </svg>
                        )}
                      </button>

                      <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-200 flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={state.isMuted ? 0 : state.volume}
                          onChange={handleVolumeChange}
                          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(state.isMuted ? 0 : state.volume) * 100}%, rgba(255,255,255,0.2) ${(state.isMuted ? 0 : state.volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                          }}
                        />
                      </div>
                    </div>

                    {/* Time Display */}
                    <div className="text-white/80 text-sm font-mono">
                      <span>{formatTime(state.currentTime)}</span>
                      <span className="mx-1">/</span>
                      <span>{formatTime(state.duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Settings Menu - Only for playback speed */}
                    {showPlaybackSpeed && (
                      <div className="relative">
                        <button
                          onClick={() => setShowSettings(!showSettings)}
                          className="p-2 text-white hover:text-blue-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                          </svg>
                        </button>

                        <AnimatePresence>
                          {showSettings && (
                            <motion.div
                              className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden min-w-[120px]"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                            >
                              <div className="p-2">
                                <p className="text-white/60 text-xs mb-2 px-2">Playback Speed</p>
                                {PLAYBACK_SPEEDS.map(speed => (
                                  <button
                                    key={speed}
                                    onClick={() => handlePlaybackSpeedChange(speed)}
                                    className={`w-full text-left px-4 py-1.5 text-sm rounded transition-colors ${state.playbackRate === speed
                                      ? 'bg-blue-500 text-white'
                                      : 'text-white/80 hover:bg-white/10'
                                      }`}
                                  >
                                    {speed}x
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 text-white hover:text-blue-400 transition-colors"
                    >
                      {state.isFullscreen ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {enableKeyboardShortcuts && (
        <div className="mt-2 text-xs text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity">
          Space: Play/Pause • M: Mute • F: Fullscreen • ←/→: Seek
        </div>
      )}
    </motion.div>
  );
};

export default FridayVideoPlayer;
