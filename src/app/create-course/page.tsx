"use client"
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaceholdersAndVanishTextarea } from '@/components/VanishInput';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useRouter } from 'next/navigation';
import Pusher from "pusher-js"

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
});

const StreamingTitle = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 40 + Math.random() * 20);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <motion.h2
      className="text-blue-300/90 font-medium mb-6 text-lg relative"
      initial={{ opacity: 0, x: -15, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {displayedText}
      </motion.span>

      {currentIndex < text.length && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-blue-300/80 ml-1 rounded-full"
          animate={{
            opacity: [1, 0.3, 1],
            scaleY: [1, 1.1, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />
      )}

      <motion.div
        className="absolute -bottom-2 left-0 h-px bg-gradient-to-r from-blue-400/60 via-blue-300/40 to-transparent rounded-full"
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: currentIndex >= text.length ? '100%' : '0%',
          opacity: currentIndex >= text.length ? 1 : 0
        }}
        transition={{
          duration: 1.2,
          delay: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      />
      {currentIndex >= text.length && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-transparent to-blue-400/10 rounded-lg -z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.95, 1.02, 1] }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
      )}
    </motion.h2>
  );
};

const StreamingText = ({ text, isComplete = false, onStreamingComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreamingComplete, setIsStreamingComplete] = useState(false);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const completionTimeoutRef = useRef(null);

  const formatText = (text) => {
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
      if (!line.trim()) return <br key={`br-${lineIndex}`} />;

      // Headers with enhanced styling
      if (line.startsWith('### ')) {
        return (
          <motion.h3
            key={`h3-${lineIndex}`}
            className="text-lg font-semibold text-blue-300/90 mt-6 mb-3"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {line.slice(4)}
          </motion.h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <motion.h2
            key={`h2-${lineIndex}`}
            className="text-xl font-semibold text-blue-300/90 mt-8 mb-4"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {line.slice(3)}
          </motion.h2>
        );
      }
      if (line.startsWith('**') && line.endsWith('**') && !line.includes(':')) {
        return (
          <motion.h3
            key={`h3-bold-${lineIndex}`}
            className="text-lg font-semibold text-white/95 mt-6 mb-3"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {line.slice(2, -2)}
          </motion.h3>
        );
      }

      // Enhanced quote blocks
      if (line.startsWith('> ')) {
        return (
          <motion.div
            key={`quote-${lineIndex}`}
            className="border-l-2 border-blue-400/30 pl-6 py-2 my-4 text-blue-200/80 italic relative"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute -left-2 top-1/2 w-1 h-8 bg-gradient-to-b from-blue-400/50 to-transparent transform -translate-y-1/2 rounded-full" />
            {line.slice(2)}
          </motion.div>
        );
      }

      // Optimized inline formatting function
      const formatInlineContent = (text) => {
        let result = [];
        let elementKey = 0;

        // Process all formatting in a single pass
        const segments = [];
        let currentPos = 0;

        // Find all formatting markers
        const markers = [];
        const patterns = [
          { regex: /\*\*(.*?)\*\*/g, type: 'bold' },
          { regex: /\*(.*?)\*/g, type: 'italic' },
          { regex: /`(.*?)`/g, type: 'code' }
        ];

        patterns.forEach(pattern => {
          let match;
          while ((match = pattern.regex.exec(text)) !== null) {
            markers.push({
              start: match.index,
              end: match.index + match[0].length,
              content: match[1],
              type: pattern.type
            });
          }
        });

        // Sort markers by position
        markers.sort((a, b) => a.start - b.start);

        // Build segments avoiding overlaps
        let lastEnd = 0;
        markers.forEach(marker => {
          if (marker.start >= lastEnd) {
            // Add text before marker
            if (marker.start > lastEnd) {
              segments.push({ type: 'text', content: text.slice(lastEnd, marker.start) });
            }
            // Add formatted marker
            segments.push(marker);
            lastEnd = marker.end;
          }
        });

        // Add remaining text
        if (lastEnd < text.length) {
          segments.push({ type: 'text', content: text.slice(lastEnd) });
        }

        // Render segments
        return segments.map(segment => {
          if (segment.type === 'text') {
            return segment.content;
          } else if (segment.type === 'bold') {
            return (
              <motion.strong
                key={`bold-${elementKey++}`}
                className="font-semibold text-white/95 relative"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                {segment.content}
              </motion.strong>
            );
          } else if (segment.type === 'italic') {
            return (
              <motion.em
                key={`italic-${elementKey++}`}
                className="italic text-blue-200/90"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                {segment.content}
              </motion.em>
            );
          } else if (segment.type === 'code') {
            return (
              <motion.code
                key={`code-${elementKey++}`}
                className="bg-blue-900/30 text-blue-200/90 px-1.5 py-0.5 rounded text-sm font-mono border border-blue-800/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {segment.content}
              </motion.code>
            );
          }
          return segment.content;
        });
      };

      if (line.startsWith('• ')) {
        const bulletContent = formatInlineContent(line.slice(2));
        return (
          <motion.div
            key={`bullet-${lineIndex}`}
            className="flex items-start gap-3 mb-2 ml-4"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, delay: lineIndex * 0.02 }}
          >
            <motion.span
              className="text-blue-400/80 mt-1.5 text-sm"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: lineIndex * 0.2
              }}
            >
              •
            </motion.span>
            <div className="text-white/75 leading-relaxed">{bulletContent}</div>
          </motion.div>
        );
      }

      // Enhanced regular paragraphs
      const formattedContent = formatInlineContent(line);
      return (
        <motion.p
          key={`p-${lineIndex}`}
          className="text-white/80 leading-relaxed mb-3"
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: lineIndex * 0.01 }}
        >
          {formattedContent}
        </motion.p>
      );
    });
  };

  // Memoize formatted content to avoid re-processing
  const formattedContent = useMemo(() => {
    if (!displayedText) return null;
    return formatText(displayedText);
  }, [displayedText]);

  // Reset state when text changes
  useEffect(() => {
    setDisplayedText('');
    setIsStreamingComplete(false);
    startTimeRef.current = null;

    // Clear any existing timers
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current);
    }
  }, [text]);

  // High-performance streaming using requestAnimationFrame
  useEffect(() => {
    if (!text || text.length === 0) return;

    const CHARS_PER_SECOND = 30; // Slower streaming speed
    const MS_PER_CHAR = 1000 / CHARS_PER_SECOND;

    const streamText = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const targetLength = Math.floor(elapsed / MS_PER_CHAR);
      const actualLength = Math.min(targetLength, text.length);

      if (actualLength > displayedText.length) {
        setDisplayedText(text.slice(0, actualLength));
      }

      if (actualLength < text.length) {
        animationFrameRef.current = requestAnimationFrame(streamText);
      } else if (!isStreamingComplete) {
        setIsStreamingComplete(true);
        if (onStreamingComplete) {
          completionTimeoutRef.current = setTimeout(() => {
            onStreamingComplete();
          }, 500); // Wait a bit after streaming completes
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(streamText);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [text, displayedText.length, isStreamingComplete, onStreamingComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="space-y-1">
        {formattedContent}

        {/* Enhanced cursor with subtle glow */}
        <AnimatePresence>
          {!isComplete && !isStreamingComplete && (
            <motion.span
              className="inline-block relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="w-0.5 h-5 bg-blue-400 ml-1 inline-block relative"
                animate={{
                  opacity: [1, 1, 0.3, 1]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Subtle glow effect */}
                <motion.span
                  className="absolute inset-0 bg-blue-400 blur-sm opacity-50"
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Minimal completed sections sidebar
const CompletedSidebar = ({ completedSections }) => {
  return (
    <motion.div
      className="fixed left-8 top-1/2 transform -translate-y-1/2 w-64 z-10"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="space-y-3">
        <AnimatePresence>
          {completedSections.map((section, index) => (
            <motion.div
              key={`completed-${index}`}
              className="relative group cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.23, 1, 0.32, 1]
              }}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center gap-3 py-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-400/60 flex-shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                />
                <motion.div
                  className="text-sm text-white/50 group-hover:text-white/70 transition-colors truncate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {section.title}
                </motion.div>
              </div>

              {/* Progress line */}
              <motion.div
                className="absolute left-1 top-8 w-px h-4 bg-white/10"
                initial={{ height: 0 }}
                animate={{ height: index < completedSections.length - 1 ? '1rem' : 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Buffer/Skeleton states for each section
const SkeletonLoader = ({ type = 'default' }) => {
  if (type === 'icons') {
    return (
      <motion.div
        className="max-w-4xl w-full text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="text-3xl font-light mb-16 text-white/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Discovering Technologies
        </motion.div>

        <div className="flex justify-center items-center gap-20">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-blue-400/10 mb-4 flex items-center justify-center"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              >
                <div className="w-8 h-8 rounded-full bg-blue-400/20" />
              </motion.div>
              <div className="w-12 h-3 bg-white/10 rounded mx-auto" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (type === 'modules') {
    return (
      <motion.div
        className="max-w-6xl w-full h-[80vh] flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="text-3xl font-light text-center mb-12 text-white/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Structuring Journey
        </motion.div>

        <div className="relative flex-1 flex items-center justify-center">
          <motion.div
            className="w-80 p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
            animate={{
              scale: [1, 1.02, 1],
              borderColor: ['rgba(255,255,255,0.1)', 'rgba(99,161,255,0.2)', 'rgba(255,255,255,0.1)']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-400/10 animate-pulse" />
              <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-white/10 rounded animate-pulse" />
              <div className="h-3 bg-white/5 rounded animate-pulse w-3/4" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 bg-blue-400/20 rounded flex-1 animate-pulse" />
              <div className="h-2 bg-white/10 rounded w-16 animate-pulse" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (type === 'course') {
    return (
      <motion.div
        className="max-w-5xl w-full text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="text-3xl font-light mb-16 text-white/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Crafting Course Details
        </motion.div>

        <div className="space-y-6">
          <div className="h-16 bg-white/10 rounded animate-pulse mx-auto w-2/3" />
          <div className="h-6 bg-white/5 rounded animate-pulse mx-auto w-1/2" />
          <div className="flex justify-center gap-16 mt-12">
            <div className="text-center space-y-2">
              <div className="h-4 bg-blue-400/20 rounded animate-pulse w-16" />
              <div className="h-3 bg-white/10 rounded animate-pulse w-20" />
            </div>
            <div className="text-center space-y-2">
              <div className="h-4 bg-blue-400/20 rounded animate-pulse w-16" />
              <div className="h-3 bg-white/10 rounded animate-pulse w-24" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-5xl w-full text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="space-y-4">
        <div className="h-12 bg-white/10 rounded animate-pulse mx-auto w-2/3" />
        <div className="h-6 bg-white/5 rounded animate-pulse mx-auto w-1/2" />
      </div>
    </motion.div>
  );
};

const GenerationTransition = ({ query }) => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden ">
      <AnimatedBackground />

      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-black to-black"
        initial={{ scale: 0, borderRadius: '50%' }}
        animate={{ scale: 3, borderRadius: '0%' }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="relative z-10 text-center max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.div
          className="text-sm text-blue-400/60 font-mono mb-4 tracking-wider"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          INITIALIZING COURSE_ARCHITECT
        </motion.div>

        <motion.h1
          className="text-3xl font-light text-white/90 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          "{query}"
        </motion.h1>

        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-400/60"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const PerfectCourseGeneration = ({ userQuery = "Build amazing web apps", onGenerationStart, isFromInput = false, channelId }) => {
  const router = useRouter();
  const [currentState, setCurrentState] = useState(isFromInput ? 'TRANSITION' : 'THINKING');
  const [currentSection, setCurrentSection] = useState({ title: '', content: '', isComplete: false, titleComplete: false });
  const [completedSections, setCompletedSections] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [icons, setIcons] = useState(null);
  const [allModules, setAllModules] = useState([]);
  const [displayedModules, setDisplayedModules] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showTransition, setShowTransition] = useState(isFromInput);
  const [planningSections, setPlanningSections] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [streamingComplete, setStreamingComplete] = useState(false);

  // Handle Pusher events
  useEffect(() => {
    if (!channelId) return;

    const channel = pusher.subscribe(channelId);

    channel.bind('THINKING_STREAM', (data) => {
      setPlanningSections(data.thinking);
      handleTransitionComplete();
    });

    channel.bind('COURSE_DATA', (data) => {
      setCourseData(data);
    });

    channel.bind('ICONS', (data) => {
      setIcons(data);
    });

    channel.bind('MODULES', (data) => {
      setAllModules(data);
    });

    channel.bind('COMPLETION', (data) => {
      setCourseId(data.courseId);
    });

    return () => {
      pusher.unsubscribe(channelId);
      // Reset state when component unmounts or channelId changes
      setAllModules([]);
      setDisplayedModules([]);
      setCourseId(null);
      setCountdown(5);
    };
  }, [channelId]);

  // Handle state transitions based on data availability
  useEffect(() => {
    if (currentState === 'THINKING' && streamingComplete && planningSections.length > 0) {
      // Move to course details after thinking is complete
      setTimeout(() => {
        setCurrentState('COURSE_DETAILS');
      }, 1500);
    } else if (currentState === 'COURSE_DETAILS' && courseData) {
      // Move to icons after course data is available (longer pause)
      setTimeout(() => {
        setCurrentState('ICONS_DISCOVERY');
      }, 10000);
    } else if (currentState === 'ICONS_DISCOVERY' && icons && icons.length > 0) {
      // Move to modules after icons are available (longer pause)
      setTimeout(() => {
        setCurrentState('MODULE_STRUCTURE');
      }, 5000);
    } else if (currentState === 'MODULE_STRUCTURE' && allModules && allModules.length > 0 && displayedModules.length === allModules.length) {
      // Move to finalizing after all modules are displayed
      setTimeout(() => {
        setCurrentState('FINALIZING');
      }, 2000);
    } else if (currentState === 'FINALIZING' && courseId) {
      // Move to completion when courseId is received
      setCurrentState('COMPLETION');
    }
  }, [currentState, streamingComplete, courseData, icons, allModules, displayedModules, planningSections, courseId]);

  // Stream modules one by one when in MODULE_STRUCTURE state (slower)
  useEffect(() => {
    if (currentState === 'MODULE_STRUCTURE' && allModules.length > 0 && displayedModules.length < allModules.length) {
      const timer = setTimeout(() => {
        setDisplayedModules(prev => [...prev, allModules[prev.length]]);
      }, displayedModules.length === 0 ? 500 : 3000); // First module appears faster, then 3s delay between each

      return () => clearTimeout(timer);
    }
  }, [currentState, allModules, displayedModules.length]);

  // Countdown timer for completion screen
  useEffect(() => {
    if (currentState === 'COMPLETION') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            router.push(`/courses/overview/${courseId}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentState, courseId, router]);

  // Fixed section streaming logic
  useEffect(() => {
    if (currentState !== 'THINKING' || planningSections.length === 0 || showTransition) {
      return;
    }

    const streamNextSection = async () => {
      if (currentSectionIndex < planningSections.length) {
        const section = planningSections[currentSectionIndex];

        // Set current section
        setCurrentSection({
          title: section.title,
          content: section.content,
          isComplete: false,
          titleComplete: false
        });

        // Wait for title to complete (keep existing timing for title)
        setTimeout(() => {
          setCurrentSection(prev => ({ ...prev, titleComplete: true }));
        }, section.title.length * 45 + 600);
      }
    };

    streamNextSection();
  }, [currentSectionIndex, planningSections, currentState, showTransition]);

  // Handle when streaming completes
  const handleSectionStreamingComplete = useCallback(() => {
    setCurrentSection(prev => ({ ...prev, isComplete: true }));

    // Move to completed sections if not the last one
    if (currentSectionIndex < planningSections.length - 1) {
      setCompletedSections(prev => [...prev, planningSections[currentSectionIndex]]);
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      // Last section completed
      setCompletedSections(prev => [...prev, planningSections[currentSectionIndex]]);
      setStreamingComplete(true);
    }
  }, [currentSectionIndex, planningSections]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}.${centiseconds.toString().padStart(2, '0')}s`;
  };

  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);
    setCurrentState('THINKING');
    onGenerationStart?.();
  }, [onGenerationStart]);

  // Update progress based on current state
  useEffect(() => {
    const progressMap = {
      'THINKING': streamingComplete ? 25 : (completedSections.length / Math.max(planningSections.length, 1)) * 25,
      'COURSE_DETAILS': courseData ? 40 : 30,
      'ICONS_DISCOVERY': icons ? 55 : 45,
      'MODULE_STRUCTURE': allModules?.length > 0 ? 65 + (displayedModules.length / allModules.length) * 20 : 65,
      'FINALIZING': 90,
      'COMPLETION': 100
    };

    const newProgress = progressMap[currentState] || 0;
    setProgress(newProgress);
  }, [currentState, completedSections.length, courseData, icons, allModules, displayedModules.length, planningSections.length, streamingComplete]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#22c55e';
      case 'Intermediate': return '#63a1ff';
      case 'Advanced': return '#f59e0b';
      default: return '#63a1ff';
    }
  };

  if (showTransition) {
    return (
      <GenerationTransition
        query={userQuery}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <AnimatedBackground />

      {/* Clean status bar */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-8 z-10">
        <div className="text-sm text-white/50 font-mono">
          {formatTime(elapsedTime)}
        </div>

        <div className="text-center">
          <div className="text-xs text-white/30 mb-1 uppercase tracking-wider">Generating Course</div>
          <div className="text-sm text-white/70 italic">"{userQuery}"</div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-light text-white/90">{Math.round(progress)}%</div>
          <div className="text-xs text-blue-400/60 font-mono uppercase tracking-wider">
            {currentState.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen px-8">
        <AnimatePresence mode="wait">

          {currentState === 'THINKING' && (
            <div className="min-h-screen flex">
              <AnimatePresence>
                {completedSections.length > 0 && (
                  <CompletedSidebar completedSections={completedSections} />
                )}
              </AnimatePresence>

              <motion.div
                className="flex-1 flex items-center justify-center px-8"
                layout
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              >
                <motion.div
                  key="thinking"
                  className="w-[800px] h-[80vh] flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.div
                    className="flex items-center gap-4 mb-12 justify-center flex-shrink-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full bg-blue-400 relative"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full border border-blue-400/30"
                        animate={{
                          scale: [1, 2, 1],
                          opacity: [0.3, 0, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border border-blue-400/20"
                        animate={{
                          scale: [1, 3, 1],
                          opacity: [0.2, 0, 0.2]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      />
                    </motion.div>

                    <div className="flex items-center gap-2">
                      <span className="text-blue-400/80 font-mono text-lg tracking-wider">COURSE_ARCHITECT</span>
                    </div>
                  </motion.div>

                  <div className="flex-1 relative overflow-hidden px-4">
                    <div className="absolute inset-0">
                      <div className="space-y-4 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-blue-400/20 scrollbar-track-transparent"
                        style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: 'rgba(99,161,255,0.2) transparent'
                        }}>

                        <AnimatePresence mode="wait">
                          {(currentSection.title || currentSection.content) && (
                            <motion.div
                              key={`current-section-${currentSectionIndex}`}
                              className="relative py-8 px-4"
                              initial={{ opacity: 0, y: 25, scale: 0.98 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                transition: {
                                  duration: 1,
                                  ease: [0.25, 0.46, 0.45, 0.94]
                                }
                              }}
                              exit={{
                                opacity: 0,
                                x: -100,
                                y: -10,
                                scale: 0.94,
                                transition: {
                                  duration: 0.7,
                                  ease: [0.4, 0, 0.2, 1]
                                }
                              }}
                            >
                              <div className="flex items-start gap-5">
                                <motion.div
                                  className="w-2.5 h-2.5 rounded-full bg-blue-400 mt-4 flex-shrink-0 relative"
                                  animate={{
                                    boxShadow: [
                                      '0 0 0 0 rgba(99, 161, 255, 0.4)',
                                      '0 0 0 12px rgba(99, 161, 255, 0)'
                                    ],
                                    scale: [1, 1.08, 1]
                                  }}
                                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                  <motion.div
                                    className="absolute inset-0 rounded-full bg-blue-400/30"
                                    animate={{
                                      scale: [1, 3, 1],
                                      opacity: [0.5, 0, 0.5]
                                    }}
                                    transition={{
                                      duration: 2.5,
                                      repeat: Infinity,
                                      ease: "easeOut"
                                    }}
                                  />
                                  <motion.div
                                    className="absolute inset-0 rounded-full bg-blue-300/20"
                                    animate={{
                                      scale: [1, 4, 1],
                                      opacity: [0.3, 0, 0.3]
                                    }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                      ease: "easeOut",
                                      delay: 0.5
                                    }}
                                  />
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                  {currentSection.title && (
                                    <StreamingTitle
                                      text={currentSection.title}
                                      onComplete={() => {
                                        setCurrentSection(prev => ({ ...prev, titleComplete: true }));
                                      }}
                                    />
                                  )}
                                  {currentSection.content && currentSection.titleComplete && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.8,
                                        ease: [0.25, 0.46, 0.45, 0.94],
                                        delay: 0.6 // Longer delay after title
                                      }}
                                    >
                                      <StreamingText
                                        text={currentSection.content}
                                        isComplete={currentSection.isComplete}
                                        onStreamingComplete={handleSectionStreamingComplete}
                                      />
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}

          {currentState === 'COURSE_DETAILS' && (
            courseData ? (
              <motion.div
                key="details"
                className="max-w-5xl w-full text-center"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 1 }}
              >
                <motion.h1
                  className="text-6xl font-light mb-8 tracking-wide text-white/95"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  {courseData.title}
                </motion.h1>

                <motion.p
                  className="text-lg text-white/70 mb-16 max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                >
                  {courseData.description}
                </motion.p>

                <motion.div
                  className="flex justify-center gap-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  <div className="text-center">
                    <div className="text-sm text-blue-400/60 font-mono uppercase tracking-wider mb-2">Level</div>
                    <div className="text-lg text-white/90">{courseData.difficultyLevel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-blue-400/60 font-mono uppercase tracking-wider mb-2">Duration</div>
                    <div className="text-lg text-white/90">{courseData.estimatedCompletionTime} Hours</div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <SkeletonLoader type="course" />
            )
          )}

          {/* Icons state */}
          {currentState === 'ICONS_DISCOVERY' && (
            icons && icons.length > 0 ? (
              <motion.div
                key="icons"
                className="max-w-4xl w-full text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <motion.div
                  className="text-3xl font-light mb-16 text-white/90"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                >
                  Core Technologies
                </motion.div>

                <div className="flex justify-center items-center gap-20">
                  <AnimatePresence>
                    {icons.map((icon, index) => (
                      <motion.div
                        key={index}
                        className="text-center"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.8,
                          delay: index * 0.3,
                          ease: [0.68, -0.55, 0.265, 1.55]
                        }}
                      >
                        <motion.div
                          className={`text-8xl mb-6 text-blue-400/90 nf nerd-font ${icon}`}
                          animate={{
                            scale: [1, 1.04, 1],
                            textShadow: [
                              '0 0 0 transparent',
                              '0 0 25px rgba(99,161,255,0.4)',
                              '0 0 0 transparent'
                            ]
                          }}
                          transition={{ duration: 5, repeat: Infinity, delay: index * 1 }}
                        >
                        </motion.div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <SkeletonLoader type="icons" />
            )
          )}

          {/* Module structure state */}
          {currentState === 'MODULE_STRUCTURE' && (
            displayedModules && displayedModules.length > 0 ? (
              <motion.div
                key="modules"
                className="max-w-6xl w-full h-[80vh] flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <motion.div
                  className="text-3xl font-light text-center mb-12 text-white/90"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                >
                  Learning Journey
                </motion.div>

                <div className="relative flex-1 flex items-center justify-center">
                  <AnimatePresence>
                    {displayedModules.map((module, index) => {
                      const isActive = index === displayedModules.length - 1;
                      let x = 0, y = 0, scale = 0.4, opacity = 0.3, zIndex = 1;

                      if (isActive) {
                        x = 0; y = 0; scale = 1; opacity = 1; zIndex = 10;
                      } else if (index === displayedModules.length - 2) {
                        x = -250; y = 40; scale = 0.7; opacity = 0.6; zIndex = 5;
                      } else if (index === displayedModules.length - 3) {
                        x = 250; y = 40; scale = 0.7; opacity = 0.6; zIndex = 5;
                      } else {
                        const angle = (index * 45 - 90) * (Math.PI / 180);
                        x = Math.cos(angle) * 350;
                        y = Math.sin(angle) * 150 + 80;
                        scale = 0.4; opacity = 0.2; zIndex = 2;
                      }

                      return (
                        <motion.div
                          key={`module-${index}`}
                          className="absolute"
                          style={{ zIndex }}
                          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                          animate={{ x, y, scale, opacity }}
                          transition={{
                            duration: 1,
                            delay: index * 0.15,
                            ease: [0.16, 1, 0.3, 1]
                          }}
                        >
                          <div
                            className={`w-80 p-6 rounded-2xl border backdrop-blur-sm ${isActive
                              ? 'bg-blue-400/5 border-blue-400/20'
                              : 'bg-white/[0.01] border-white/5'
                              }`}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className={`w-12 h-12 rounded-lg flex nerd-font ${module.icon} items-center justify-center text-xl ${isActive
                                  ? 'bg-blue-400/10 text-blue-400'
                                  : 'bg-white/5 text-white/40'
                                  }`}
                              >
                              </div>
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${isActive ? 'bg-blue-400 text-black' : 'bg-white/10 text-white/40'
                                  }`}
                              >
                                {index + 1}
                              </div>
                            </div>

                            <h3 className={`text-lg font-medium mb-2 ${isActive ? 'text-white/95' : 'text-white/60'}`}>
                              {module.title}
                            </h3>
                            <p className={`text-sm mb-3 leading-relaxed ${isActive ? 'text-white/75' : 'text-white/40'}`}>
                              {module.description}
                            </p>

                            <div className="flex items-center gap-3 text-xs">
                              <span className={isActive ? 'text-blue-400' : 'text-white/30'}>
                                {module.chapters || 0} chapters
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full border ${isActive
                                  ? 'border-blue-400/20 bg-blue-400/5 text-blue-400'
                                  : 'border-white/10 bg-white/5 text-white/30'
                                  }`}
                              >
                                {module.duration || '1 week'}
                              </span>
                              <span
                                className="px-2 py-1 rounded-full border"
                                style={{
                                  color: isActive ? getDifficultyColor(module.difficulty) : 'rgba(255,255,255,0.3)',
                                  borderColor: isActive
                                    ? `${getDifficultyColor(module.difficulty)}20`
                                    : 'rgba(255,255,255,0.1)',
                                  backgroundColor: isActive
                                    ? `${getDifficultyColor(module.difficulty)}05`
                                    : 'rgba(255,255,255,0.05)'
                                }}
                              >
                                {module.difficulty || 'Beginner'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-center gap-2 mt-8">
                  {allModules.map((_, index) => (
                    <div
                      key={`dot-${index}`}
                      className={`w-1.5 h-1.5 rounded-full ${index < displayedModules.length
                        ? (index === displayedModules.length - 1 ? 'bg-blue-400' : 'bg-blue-400/50')
                        : 'bg-white/20'
                        }`}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <SkeletonLoader type="modules" />
            )
          )}

          {/* Finalizing state - waiting for completion */}
          {currentState === 'FINALIZING' && (
            <motion.div
              key="finalizing"
              className="max-w-4xl w-full text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1 }}
            >
              <motion.div
                className="text-6xl mb-8"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                ⚡
              </motion.div>

              <motion.h1
                className="text-4xl font-light mb-6 text-white/95"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Finalizing Course
              </motion.h1>

              <motion.p
                className="text-lg text-white/60 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Putting the finishing touches on your learning journey
              </motion.p>

              <motion.div
                className="flex justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-400/60"
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Completion state with countdown */}
          {currentState === 'COMPLETION' && (
            <motion.div
              key="completion"
              className="max-w-4xl w-full text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.68, -0.55, 0.265, 1.55] }}
            >
              <motion.div
                className="text-8xl mb-8"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ✨
              </motion.div>

              <motion.h1
                className="text-5xl font-light mb-6 text-white/95"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                Course Ready!
              </motion.h1>

              <motion.p
                className="text-lg text-white/70 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                Your personalized learning journey is ready to begin
              </motion.p>

              <motion.div
                className="text-3xl font-light text-blue-400 mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                {countdown}
              </motion.div>

              <motion.p
                className="text-sm text-white/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                Redirecting you to the course page in {countdown} seconds...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CourseGenerationApp = () => {
  const [showGeneration, setShowGeneration] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [generationStarted, setGenerationStarted] = useState(false);
  const [generationId, setGenerationId] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const placeholders = [
    "I'm a beginner wanting to build web apps for my startup",
    "Data analyst learning ML to predict customer behavior",
    "Java dev transitioning to Python in 3 months",
    "Complete beginner creating mobile apps for food delivery",
    "Finance professional exploring blockchain for investments",
    "Developer learning UI/UX design for better interfaces",
    "Building scalable APIs for my e-commerce platform"
  ];
  const handleSubmit = useCallback(async (e) => {
    if (userQuery.trim() && !generationStarted && !createLoading) {
      e.preventDefault();
      if (createLoading) return;
      setCreateLoading(true);
      try {
        const response = await fetch('/api/course/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userQuery: userQuery })
        });
        if (response.ok) {
          const result = await response.json();
          const generationId = result.data.id;
          if (generationId) {
            setGenerationId(generationId)
            setShowGeneration(true);
          };
        }
        if (!response.ok) {
          const body = await response.json();
          setErrorMessage(body.message || "Opps! Something went wrong. Please try again.");
        }
      } catch (err) {
        console.error('Failed to create course:', err);
      } finally {
        setCreateLoading(false);
      }
    }
  }, [userQuery, generationStarted, createLoading]);

  const handleChange = useCallback(async (e) => {
    if (e && e.target) {
      setUserQuery(e.target.value);
    }
  }, []);

  const handleGenerationStart = useCallback(() => {
    setGenerationStarted(true);
  }, []);

  if (showGeneration) {
    return (
      <PerfectCourseGeneration
        userQuery={userQuery || "Build amazing web apps"}
        isFromInput={true}
        onGenerationStart={handleGenerationStart}
        channelId={generationId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 relative">
      <AnimatedBackground />

      <div className="max-w-2xl w-full">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-light mb-4 text-white/95">Generate Your Course</h1>
          <p className="text-white/60">Describe what you want to learn and we'll create a personalized course</p>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <PlaceholdersAndVanishTextarea
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={handleSubmit}
            maxLength={280}
            isLoading={createLoading}
          />
        </motion.div>
        {/* Minimal Guidelines */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-white/40 text-sm font-light">
            Include your skill level, goals, and context for a personalized course
          </p>
        </motion.div>
        {errorMessage &&
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-red-300 text-sm font-light">
              {errorMessage}
            </p>
          </motion.div>
        }

      </div>
    </div>
  );
};

export default CourseGenerationApp;
