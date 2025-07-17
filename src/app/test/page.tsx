"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StreamingTimelineExperience = ({ userQuery = "Build amazing web apps" }) => {
  const [progress, setProgress] = useState(0);
  const [streamedNodes, setStreamedNodes] = useState([]);
  const [activeNodeIndex, setActiveNodeIndex] = useState(-1);
  const [nobPosition, setNobPosition] = useState(100); // Start at bottom (100%)
  const [showingLabels, setShowingLabels] = useState([]);

  const timelineNodes = [
    {
      id: 'start',
      threshold: 5,
      icon: '✨',
      label: 'Inception',
      description: 'Your vision begins to take shape',
      position: 90
    },
    {
      id: 'analysis',
      threshold: 20,
      icon: '🧠',
      label: 'Analysis',
      description: 'Understanding your learning goals',
      position: 72
    },
    {
      id: 'structure',
      threshold: 40,
      icon: '🏗️',
      label: 'Architecture',
      description: 'Course structure forming',
      position: 54
    },
    {
      id: 'content',
      threshold: 60,
      icon: '📚',
      label: 'Content',
      description: 'Knowledge crystallizing',
      position: 36
    },
    {
      id: 'projects',
      threshold: 80,
      icon: '🚀',
      label: 'Projects',
      description: 'Real-world applications',
      position: 18
    },
    {
      id: 'completion',
      threshold: 95,
      icon: '🎯',
      label: 'Mastery',
      description: 'Your journey awaits',
      position: 5
    }
  ];

  useEffect(() => {
    const duration = 120000; // 2 minutes
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 100));
        const finalProgress = Math.min(newProgress, 100);

        // Check for new nodes that should be activated
        const newStreamedNodes = timelineNodes.filter(
          node => finalProgress >= node.threshold &&
            !streamedNodes.find(streamed => streamed.id === node.id)
        );

        if (newStreamedNodes.length > 0) {
          const updatedStreamedNodes = [...streamedNodes, ...newStreamedNodes];
          const newActiveIndex = updatedStreamedNodes.length - 1;

          setStreamedNodes(updatedStreamedNodes);
          setActiveNodeIndex(newActiveIndex);

          // Animate nob to new position first
          const targetNode = updatedStreamedNodes[newActiveIndex];
          setNobPosition(targetNode.position);

          // Then show label after nob animation completes
          setTimeout(() => {
            setShowingLabels(prev => [...prev, targetNode.id]);
          }, 1900); // 
        }

        return finalProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [streamedNodes]);

  const timelineFillHeight = nobPosition === 100 ? 0 : Math.max(0, 100 - nobPosition);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">

      {/* Subtle Grid */}
      <div
        className="fixed inset-0 opacity-[0.01]"
        style={{
          backgroundImage: `radial-gradient(circle, #3B82F6 1px, transparent 1px)`,
          backgroundSize: '120px 120px'
        }}
      />

      {/* Subtle Background Blob */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, #3B82F6 0%, #6366F1 50%, transparent 100%)`,
          right: '20%',
          top: '25%'
        }}
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [0.04, 0.08, 0.04]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="absolute left-16 top-0 h-full w-2/3 flex items-center">
        <div className="relative h-3/5 w-full max-w-4xl">

          <div className="flex h-full items-stretch">

            {/* Left Side Content */}
            <div className="flex-1 relative">
              <AnimatePresence>
                {streamedNodes.map((node, index) => {
                  const isActive = index === activeNodeIndex;
                  const isOlder = index < activeNodeIndex;
                  const isLeftSide = index % 2 === 0; // Even indices go to left
                  const shouldShow = showingLabels.includes(node.id);

                  if (!isLeftSide || !shouldShow) return null;

                  return (
                    <motion.div
                      key={node.id}
                      className="absolute right-8 flex items-center gap-4"
                      style={{
                        top: `${node.position}%`,
                        transform: 'translateY(-50%)'
                      }}
                      initial={{
                        opacity: 0,
                        x: -60,
                        scale: 0.6
                      }}
                      animate={{
                        opacity: isOlder ? 0.4 : 1,
                        x: 0,
                        scale: isActive ? 1.05 : isOlder ? 0.95 : 1
                      }}
                      exit={{
                        opacity: 0,
                        x: -30,
                        scale: 0.8
                      }}
                      transition={{
                        duration: 0.8,
                        ease: [0.23, 1, 0.32, 1],
                        delay: 0.1
                      }}
                    >
                      <motion.div
                        className="text-2xl text-blue-400/90"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{
                          scale: isActive ? [1, 1.15, 1] : 1,
                          rotate: 0,
                          filter: isActive ? [
                            'drop-shadow(0 0 0 rgba(59, 130, 246, 0))',
                            'drop-shadow(0 0 12px rgba(59, 130, 246, 0.8))',
                            'drop-shadow(0 0 0 rgba(59, 130, 246, 0))'
                          ] : 'none'
                        }}
                        transition={{
                          scale: {
                            duration: 2.5,
                            repeat: isActive ? Infinity : 0,
                            ease: "easeInOut"
                          },
                          rotate: {
                            duration: 0.6,
                            ease: [0.23, 1, 0.32, 1],
                            delay: 0.2
                          }
                        }}
                      >
                        {node.icon}
                      </motion.div>

                      <div className="text-right">
                        <motion.div
                          className="text-sm text-blue-400/90 font-mono tracking-wide uppercase mb-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: isActive ? [0.8, 1, 0.8] : isOlder ? 0.5 : 0.8,
                            y: 0,
                            filter: isActive ? [
                              'drop-shadow(0 0 0 rgba(59, 130, 246, 0))',
                              'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))',
                              'drop-shadow(0 0 0 rgba(59, 130, 246, 0))'
                            ] : 'none'
                          }}
                          transition={{
                            y: { duration: 0.5, delay: 0.3 },
                            opacity: {
                              duration: 2.5,
                              repeat: isActive ? Infinity : 0,
                              ease: "easeInOut"
                            }
                          }}
                        >
                          {node.label}
                        </motion.div>

                        <AnimatePresence>
                          {(isActive || !isOlder) && (
                            <motion.div
                              className="text-base text-white/90 font-light tracking-wide"
                              initial={{ opacity: 0, height: 0, y: 5 }}
                              animate={{
                                opacity: isActive ? 1 : 0.7,
                                height: 'auto',
                                y: 0,
                                color: isActive ? '#60A5FA' : 'rgba(255, 255, 255, 0.9)'
                              }}
                              exit={{ opacity: 0, height: 0, y: -5 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                            >
                              {node.description}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="relative w-1 mx-8 h-full">
              <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-t from-white/5 via-white/3 to-white/5 rounded-full" />

              <motion.div
                className="absolute left-0 bottom-0 w-full rounded-full "
                style={{
                  background: 'linear-gradient(to top, #3B82F6 0%, #6366F1 60%, #8B5CF6 100%)',
                  boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)'
                }}

                animate={{
                  height: `${timelineFillHeight}%`,
                }}
                transition={{
                  duration: 1.8,
                  ease: [0.34, 1.56, 0.64, 1],
                  type: "spring",
                  stiffness: 60,
                  damping: 15,
                }}
              />

              <motion.div
                className="absolute w-3 h-3 rounded-full -left-1 border border-white/30 shadow-lg"
                animate={{
                  top: `${nobPosition}%`,
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.2)',
                    '0 0 15px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.3)',
                    '0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.2)'
                  ]
                }}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #60A5FA 30%, #3B82F6 100%)',
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
                transition={{
                  top: {
                    duration: 1.8,
                    ease: [0.34, 1.56, 0.64, 1],
                    type: "spring",
                    stiffness: 60,
                    damping: 15
                  },
                }}
              />

              <AnimatePresence>
                {streamedNodes.map((node, index) => {
                  const isLeftSide = index % 2 === 0;
                  const shouldShow = showingLabels.includes(node.id);
                  const isCurrentNode = index === activeNodeIndex;

                  if (!shouldShow) return null;

                  return (
                    <motion.div
                      key={`line-${node.id}`}
                      className="absolute h-0.5"
                      style={{
                        left: isLeftSide ? '-36px' : '4px',
                        width: '36px',
                        transform: 'translateY(-50%)',
                        transformOrigin: isLeftSide ? 'right center' : 'left center',
                        background: isLeftSide
                          ? 'linear-gradient(to left, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.1))'
                          : 'linear-gradient(to right, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.1))',
                        boxShadow: '0 0 4px rgba(59, 130, 246, 0.3)',
                        zIndex: 4
                      }}
                      initial={{
                        scaleX: 0,
                        opacity: 0,
                        top: `${node.position}%`
                      }}
                      animate={{
                        scaleX: 1,
                        opacity: isCurrentNode ? 1 : 0.7,
                        top: isCurrentNode ? `${nobPosition + 0.75}%` : `${node.position}%`
                      }}
                      exit={{
                        scaleX: 0,
                        opacity: 0
                      }}
                      transition={{
                        scaleX: { delay: 1.8, duration: 0.8, ease: [0.23, 1, 0.32, 1] },
                        opacity: { delay: 1.8, duration: 0.8, ease: [0.23, 1, 0.32, 1] },
                        top: isCurrentNode ? {
                          duration: 1.8,
                          ease: [0.34, 1.56, 0.64, 1],
                          type: "spring",
                          stiffness: 60,
                          damping: 15
                        } : { duration: 0 }
                      }}
                    />
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right Side Content */}
            <div className="flex-1 relative">
              <AnimatePresence>
                {streamedNodes.map((node, index) => {
                  const isActive = index === activeNodeIndex;
                  const isOlder = index < activeNodeIndex;
                  const isRightSide = index % 2 === 1; // Odd indices go to right
                  const shouldShow = showingLabels.includes(node.id);

                  if (!isRightSide || !shouldShow) return null;

                  return (
                    <motion.div
                      key={`right-${node.id}`}
                      className="absolute left-8 flex items-center gap-4"
                      style={{
                        top: `${node.position}%`,
                        transform: 'translateY(-50%)'
                      }}
                      initial={{
                        opacity: 0,
                        x: 60,
                        scale: 0.6
                      }}
                      animate={{
                        opacity: isOlder ? 0.4 : 1,
                        x: 0,
                        scale: isActive ? 1.05 : isOlder ? 0.95 : 1
                      }}
                      exit={{
                        opacity: 0,
                        x: 30,
                        scale: 0.8
                      }}
                      transition={{
                        duration: 0.8,
                        ease: [0.23, 1, 0.32, 1],
                        delay: 0.1
                      }}
                    >
                      <div className="text-left">
                        <motion.div
                          className="text-sm text-blue-400/90 font-mono tracking-wide uppercase mb-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: isActive ? [0.8, 1, 0.8] : isOlder ? 0.5 : 0.8,
                            y: 0,
                            filter: isActive ? [
                              'drop-shadow(0 0 0 rgba(59, 130, 246, 0))',
                              'drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))',
                              'drop-shadow(0 0 0 rgba(59, 130, 246, 0))'
                            ] : 'none'
                          }}
                          transition={{
                            y: { duration: 0.5, delay: 0.3 },
                            opacity: {
                              duration: 2.5,
                              repeat: isActive ? Infinity : 0,
                              ease: "easeInOut"
                            }
                          }}
                        >
                          {node.label}
                        </motion.div>

                        <AnimatePresence>
                          {(isActive || !isOlder) && (
                            <motion.div
                              className="text-base text-white/90 font-light tracking-wide"
                              initial={{ opacity: 0, height: 0, y: 5 }}
                              animate={{
                                opacity: isActive ? 1 : 0.7,
                                height: 'auto',
                                y: 0,
                                color: isActive ? '#60A5FA' : 'rgba(255, 255, 255, 0.9)'
                              }}
                              exit={{ opacity: 0, height: 0, y: -5 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                            >
                              {node.description}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <motion.div
                        className="text-2xl text-blue-400/90"
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{
                          scale: isActive ? [1, 1.15, 1] : 1,
                          rotate: 0,
                          filter: isActive ? [
                            'drop-shadow(0 0 0 rgba(59, 130, 246, 0))',
                            'drop-shadow(0 0 12px rgba(59, 130, 246, 0.8))',
                            'drop-shadow(0 0 0 rgba(59, 130, 246, 0))'
                          ] : 'none'
                        }}
                        transition={{
                          scale: {
                            duration: 2.5,
                            repeat: isActive ? Infinity : 0,
                            ease: "easeInOut"
                          },
                          rotate: {
                            duration: 0.6,
                            ease: [0.23, 1, 0.32, 1],
                            delay: 0.2
                          }
                        }}
                      >
                        {node.icon}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Status */}
      <div className="absolute right-0 top-0 h-full w-1/3 flex items-center justify-center pr-16">
        <div className="text-center max-w-md">

          {/* Progress Display */}
          <div className="mb-12">
            <motion.div
              className="text-6xl font-extralight text-white/95 tracking-wider mb-4"
              animate={{
                textShadow: [
                  '0 0 0 transparent',
                  '0 0 30px rgba(59, 130, 246, 0.4)',
                  '0 0 0 transparent'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {Math.round(progress)}%
            </motion.div>
            <motion.div
              className="text-sm text-gray-400/90 font-light tracking-wide"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Course Creation Progress
            </motion.div>
          </div>

          <motion.div
            className="space-y-6"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <div className="text-xs text-blue-400/70 font-mono tracking-[0.3em] uppercase">
              Building Your Future
            </div>

            <motion.div
              className="text-gray-300/90 font-light tracking-wide italic text-lg leading-relaxed"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              "{userQuery}"
            </motion.div>

            <AnimatePresence>
              {activeNodeIndex >= 0 && streamedNodes[activeNodeIndex] && (
                <motion.div
                  className="mt-8 flex items-center justify-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <span className="text-2xl text-blue-400">
                    {streamedNodes[activeNodeIndex].icon}
                  </span>
                  <span className="text-sm text-white/80 font-mono tracking-wide">
                    {streamedNodes[activeNodeIndex].label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StreamingTimelineExperience;
