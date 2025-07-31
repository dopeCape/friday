"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaceholdersAndVanishTextarea } from '@/components/VanishInput';
import VideoPlayer from '@/components/Course/VideoPlayer';
import { Video, Brain, Palette, Zap, Sparkles } from 'lucide-react';
import Pusher from "pusher-js"

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
});

const MinimalVideoLoader = ({ userQuery }) => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Elegant background blobs */}
      <motion.div
        className="fixed inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 15% 25%, rgba(99,161,255,0.08) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(99,161,255,0.06) 0%, transparent 60%)',
            'radial-gradient(circle at 85% 25%, rgba(99,161,255,0.06) 0%, transparent 60%), radial-gradient(circle at 15% 75%, rgba(99,161,255,0.08) 0%, transparent 60%)',
            'radial-gradient(circle at 15% 25%, rgba(99,161,255,0.08) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(99,161,255,0.06) 0%, transparent 60%)'
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Elegant floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/15 rounded-full"
          style={{
            left: `${10 + i * 10}%`,
            top: `${15 + i * 8}%`,
          }}
          animate={{
            y: [0, -600, -1200],
            x: [0, Math.sin(i * 0.4) * 50, 0],
            opacity: [0, 0.4, 0],
            scale: [0.8, 1.3, 0.8]
          }}
          transition={{
            duration: 18 + i * 3,
            repeat: Infinity,
            delay: i * 2.5,
            ease: "easeOut"
          }}
        />
      ))}

      <div className="absolute top-0  right-0 flex justify-center  w-full items-center  p-8 z-20">
        <div className="text-center ">
          <div className="text-xs text-white/25 mb-1 uppercase tracking-[0.3em] font-mono">Generating</div>
          <div className="text-sm text-white/60 font-light max-w-md truncate">"{userQuery}"</div>
        </div>

      </div>

      {/* Main elegant content */}
      <div className="flex items-center justify-center min-h-screen relative z-20">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Elegant central icon with glow */}
          <motion.div
            className="mb-20 relative"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 w-28 h-28 mx-auto rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(99, 161, 255, 0)',
                  '0 0 80px 0 rgba(99, 161, 255, 0.15)',
                  '0 0 0 0 rgba(99, 161, 255, 0)'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main icon container */}
            <motion.div
              className="w-28 h-28 mx-auto rounded-2xl bg-blue-400/8 border border-blue-400/20 flex items-center justify-center relative overflow-hidden backdrop-blur-sm"
              animate={{
                scale: [1, 1.02, 1],
                borderColor: ['rgba(99,161,255,0.2)', 'rgba(99,161,255,0.35)', 'rgba(99,161,255,0.2)'],
                backgroundColor: ['rgba(99,161,255,0.08)', 'rgba(99,161,255,0.12)', 'rgba(99,161,255,0.08)']
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Video className="w-12 h-12 text-blue-400/80" />

              {/* Corner accents */}
              <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-blue-400/30 rounded-tl-md" />
              <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-blue-400/30 rounded-tr-md" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-blue-400/30 rounded-bl-md" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-blue-400/30 rounded-br-md" />
            </motion.div>

            {/* Elegant outer ring */}
            <motion.div
              className="absolute inset-0 w-28 h-28 mx-auto rounded-2xl border border-blue-400/10"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.1, 0.3],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* Elegant title */}
          <motion.h1
            className="text-4xl font-light mb-4 text-white/85 tracking-wide"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 0.5 }}
          >
            Crafting Tutorial
          </motion.h1>

          {/* Elegant description */}
          <motion.p
            className="text-lg text-white/50 mb-4 font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 0.7 }}
          >
            AI is analyzing your concept and generating
            <br />
            a comprehensive tutorial. This may take up to 3-5 minutes.
          </motion.p>

          {/* Do not refresh warning */}
          <motion.div
            className="mb-16 px-4 py-2 rounded-lg border border-blue-400/15 bg-blue-400/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 0.9 }}
          >
            <p className="text-sm text-blue-300/80 font-light">
              <span className="text-blue-400/90 font-medium">⚠️ Important:</span> Please do not refresh or close this page during generation
            </p>
          </motion.div>

          {/* Elegant progress indicator */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8, delay: 0.9 }}
          >
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="relative"
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-blue-400/30"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 0.8, 0.3],
                      backgroundColor: [
                        'rgba(99,161,255,0.3)',
                        'rgba(99,161,255,0.7)',
                        'rgba(99,161,255,0.3)'
                      ]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: "easeInOut"
                    }}
                  />
                  {/* Dot glow */}
                  <motion.div
                    className="absolute inset-0 w-2 h-2 rounded-full bg-blue-400/40"
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-sm text-white/35 font-mono tracking-[0.25em]"
              animate={{ opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            >
              ANALYZING • PROCESSING • RENDERING
            </motion.div>
          </motion.div>

          {/* Elegant status indicators */}
          <motion.div
            className="flex justify-center gap-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 1.1 }}
          >
            {[
              { icon: Brain, label: 'Analysis', active: true },
              { icon: Palette, label: 'Synthesis', active: true },
              { icon: Zap, label: 'Export', active: false }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center relative"
                animate={{
                  opacity: item.active ? [0.5, 0.8, 0.5] : 0.25
                }}
                transition={{
                  duration: 2.5,
                  repeat: item.active ? Infinity : 0,
                  delay: index * 0.5
                }}
              >
                <item.icon className={`w-6 h-6 mx-auto mb-3 ${item.active ? 'text-blue-400/60' : 'text-white/20'}`} />
                <div className={`text-sm font-light ${item.active ? 'text-white/50' : 'text-white/20'}`}>
                  {item.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const VideoGenerationApp = () => {
  const [currentState, setCurrentState] = useState('INPUT');
  const [userQuery, setUserQuery] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [generationId, setGenerationId] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');

  const placeholders = [
    "Explain React hooks with animated code examples and console outputs",
    "Show how to build a REST API from scratch with live terminal commands",
    "Demonstrate Git workflow with branching and merging visualizations",
    "Tutorial on Docker containerization with step-by-step terminal actions",
    "Animated explanation of database relationships and SQL queries",
    "Walk through setting up CI/CD pipeline with real-time deployments",
    "Show JavaScript async/await concepts with visual promise chains"
  ];

  // Handle Pusher events
  useEffect(() => {
    if (!generationId) return;

    const channel = pusher.subscribe(generationId);

    channel.bind('VIDEO_READY', (data) => {
      if (data?.videoUrl) {
        setVideoUrl(data.videoUrl);
        setCurrentState('VIDEO');
      }
    });

    return () => {
      pusher.unsubscribe(generationId);
    };
  }, [generationId]);

  const handleSubmit = useCallback(async (e) => {
    if (userQuery.trim() && !createLoading) {
      e.preventDefault();
      setCreateLoading(true);
      setError('');

      try {
        const response = await fetch('/api/video/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userQuery })
        });

        const result = await response.json();

        if (response.ok) {
          setGenerationId(result.data.id);
          setCurrentState('LOADING');
        } else {
          // Handle API errors (like rate limiting)
          setError(result.message || 'Failed to start video generation');
        }
      } catch (err) {
        console.error('Failed to start video generation:', err);
        setError('Network error. Please try again.');
      } finally {
        setCreateLoading(false);
      }
    }
  }, [userQuery, createLoading]);

  const handleChange = useCallback((e) => {
    if (e && e.target) {
      setUserQuery(e.target.value);
    }
  }, []);

  const handleBackToInput = useCallback(() => {
    setCurrentState('INPUT');
    setUserQuery('');
    setVideoUrl('');
    setGenerationId('');
    setError('');
  }, []);

  if (currentState === 'LOADING') {
    return <MinimalVideoLoader userQuery={userQuery} />;
  }

  if (currentState === 'VIDEO') {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <motion.div
          className="fixed inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 15% 25%, rgba(99,161,255,0.06) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(99,161,255,0.04) 0%, transparent 60%)',
              'radial-gradient(circle at 85% 25%, rgba(99,161,255,0.04) 0%, transparent 60%), radial-gradient(circle at 15% 75%, rgba(99,161,255,0.06) 0%, transparent 60%)',
              'radial-gradient(circle at 15% 25%, rgba(99,161,255,0.06) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(99,161,255,0.04) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="flex items-center justify-center min-h-screen px-8 py-12 relative z-20">
          <motion.div
            className="max-w-4xl w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <h1 className="text-4xl font-light text-white/95">Your Video is Ready!</h1>
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-white/60 text-lg">"{userQuery}"</p>
            </motion.div>

            {/* Video Player */}
            <motion.div
              className="mb-8 rounded-2xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <VideoPlayer src={videoUrl} />
            </motion.div>

            {/* Actions */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                onClick={handleBackToInput}
                className="px-8 py-3 rounded-xl border border-blue-400/20 bg-blue-400/5 text-blue-400 hover:bg-blue-400/10 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Generate Another Video
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 relative">
      <motion.div
        className="fixed inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 15% 25%, rgba(99,161,255,0.06) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(99,161,255,0.04) 0%, transparent 60%)',
            'radial-gradient(circle at 85% 25%, rgba(99,161,255,0.04) 0%, transparent 60%), radial-gradient(circle at 15% 75%, rgba(99,161,255,0.06) 0%, transparent 60%)',
            'radial-gradient(circle at 15% 25%, rgba(99,161,255,0.06) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(99,161,255,0.04) 0%, transparent 60%)'
          ]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-blue-400/15 rounded-full"
          style={{
            left: `${5 + i * 12}%`,
            top: `${10 + i * 10}%`,
          }}
          animate={{
            y: [0, -400, -800],
            x: [0, Math.sin(i * 0.3) * 40, 0],
            opacity: [0, 0.3, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 20 + i * 4,
            repeat: Infinity,
            delay: i * 4,
            ease: "easeOut"
          }}
        />
      ))}

      <div className="max-w-2xl w-full relative z-20">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-light mb-4 text-white/95">Create Tutorial Videos</h1>
          <p className="text-white/60">Generate step-by-step coding tutorials and technical explanations with AI</p>
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

        {/* Guidelines */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-white/40 text-sm font-light">
            Describe technical concepts, coding workflows, or development processes you want explained
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mt-4 p-4 rounded-xl border border-red-400/20 bg-red-400/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-red-300/90 text-sm font-medium text-center">
              {error}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VideoGenerationApp;
