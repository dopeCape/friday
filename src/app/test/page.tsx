"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface Course {
  _id: string;
  title: string;
  description: string;
  isPrivate: boolean;
  isUnique: boolean;
  icon: string[];
  templateId: string;
  isFromTemplate: boolean;
  createdBy: string;
  isSystemGenerated: boolean;
  technologies: string[];
  internalDescription: string;
  moduleIds: string[];
  currentModuleId?: string;
  isEnhanced: boolean;
  difficultyLevel: "beginner" | "intermediate" | "advanced" | "expert";
  prerequisites: string[];
  estimatedCompletionTime: number;
  learningObjectives: string[];
  keywords: string[];
}

interface Module {
  _id: string;
  title: string;
  description: string;
  courseId: string;
  refs: string[];
  contents: string[];
  isLocked: boolean;
  isCompleted: boolean;
  currentChapterId: string;
  icon: string;
  difficultyLevel: "beginner" | "intermediate" | "advanced" | "expert";
  prerequisites: string[];
  estimatedCompletionTime: number;
  learningObjectives: string[];
  moduleType: "content" | "assignment";
}

interface ChapterContent {
  type: "text" | "code" | "diagram";
  content: string;
  codeBlockLanguage?: string;
}

interface Chapter {
  _id: string;
  title: string;
  content: ChapterContent[];
  isGenerated: boolean;
  refs: string[];
  moduleId: string;
  type: string;
  isCompleted: boolean;
  isUserSpecific: boolean;
  isActive?: boolean;
  description?: string;
  estimatedTime?: string;
}

interface CourseData {
  course: Course;
  modules: Module[];
  chapters: Chapter[];
}

interface ApiResponse {
  success: boolean;
  data: CourseData;
  message?: string;
}

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

interface NotFoundScreenProps {
  courseId: string;
  onGoHome: () => void;
}

const fetchCourseData = async (courseId: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`/api/course/${courseId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('COURSE_NOT_FOUND');
      }
      throw new Error('Failed to fetch course data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching course data:', error);
    throw error;
  }
};

const MinimalElements: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 4 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-px h-px bg-[#63a1ff]/20"
        style={{
          left: `${20 + Math.random() * 60}%`,
          top: `${20 + Math.random() * 60}%`,
        }}
        animate={{
          opacity: [0, 0.4, 0],
          scale: [1, 3, 1],
        }}
        transition={{
          duration: 12 + Math.random() * 8,
          delay: Math.random() * 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

// Enhanced AI Loading
interface LoadingScreenProps {
  onComplete: () => void;
}

const EnhancedLoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);

  const phases = [
    "parsing",
    "analyzing",
    "generating",
    "optimizing",
    "compiling"
  ];

  useEffect(() => {
    let phaseIndex = 0;
    let currentProgress = 0;

    const processPhase = () => {
      if (phaseIndex >= phases.length) {
        setTimeout(onComplete, 200);
        return;
      }

      setCurrentPhase(phaseIndex);
      const phaseProgress = 100 / phases.length;

      const timer = setInterval(() => {
        currentProgress += (phaseProgress / 500) * 50;
        setProgress(Math.min(currentProgress, (phaseIndex + 1) * phaseProgress));

        if (currentProgress >= (phaseIndex + 1) * phaseProgress) {
          clearInterval(timer);
          phaseIndex++;
          setTimeout(processPhase, 150);
        }
      }, 50);
    };

    processPhase();
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center space-y-16">
        <div className="relative flex flex-col items-center">
          <motion.div
            className="w-px h-16 bg-[linear-gradient(to_bottom,transparent,#63a1ff,transparent)] bg-[length:1px_4px] mx-auto"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 64, opacity: 0.6 }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px bg-[#63a1ff]"
            style={{ height: `${progress}%` }}
          />

          {/* Phase dots */}
          <div className="absolute -right-12 top-0 h-full flex flex-col justify-between py-2">
            {phases.map((_, index) => (
              <motion.div
                key={index}
                className={`w-1 h-1 rounded-full ${index <= currentPhase ? 'bg-[#63a1ff]/80' : 'bg-white/10'
                  }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.5 }}
              />
            ))}
          </div>

          {/* Progress number */}
          <motion.div
            className="absolute -left-16 top-1/2 transform -translate-y-1/2 text-[#63a1ff]/60 text-xs font-mono"
            key={Math.round(progress)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {String(Math.round(progress)).padStart(2, '0')}
          </motion.div>
        </div>

        {/* Phase text with Friday flair */}
        <div className="space-y-6">
          <motion.div
            className="text-[var(--friday-mute-color)] text-sm font-mono tracking-wider"
            key={currentPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {phases[currentPhase]}
          </motion.div>

          {/* Elegant loading dots */}
          <motion.div
            className="flex justify-center gap-2"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-px bg-[#63a1ff]/30"
                animate={{
                  scaleX: [1, 3, 1],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </motion.div>
        </div>

        <motion.div
          className="text-xs text-white/15 font-mono tracking-wider"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          AI_ENGINE_2.1
        </motion.div>
      </div>
    </motion.div>
  );
};

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRetry }) => {
  return (
    <motion.div
      className="fixed inset-0  flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center space-y-12 max-w-md">
        {/* Error icon with animation */}
        <motion.div
          className="relative mx-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-16 h-16 border border-red-500/30 rounded-full flex items-center justify-center relative"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <span className="nf nf-cod-error text-2xl text-red-500/80"></span>
          </motion.div>

          {/* Pulsing dots around the error icon */}
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-500/40 rounded-full"
              style={{
                left: `${50 + 25 * Math.cos((i * 120 * Math.PI) / 180)}%`,
                top: `${50 + 25 * Math.sin((i * 120 * Math.PI) / 180)}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </motion.div>

        {/* Error content */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="space-y-3">
            <h1 className="text-2xl text-white font-light">
              Connection Failed
            </h1>
            <p className="text-[var(--friday-mute-color)] leading-relaxed">
              Unable to load course data. The server might be temporarily unavailable or there's a network issue.
            </p>
          </div>

          <motion.div
            className="text-xs text-red-500/60 font-mono tracking-wider bg-red-500/5 border border-red-500/20 rounded-sm px-4 py-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            ERROR: {error}
          </motion.div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            className="px-6 py-3 bg-[#63a1ff]/10 border border-[#63a1ff]/30 text-[#63a1ff] rounded-sm hover:bg-[#63a1ff]/20 transition-colors"
            onClick={onRetry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Try Again
          </motion.button>

          <motion.button
            className="px-6 py-3 text-white/50 hover:text-white transition-colors"
            onClick={() => window.location.href = '/'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Go Home
          </motion.button>
        </motion.div>

        {/* Floating error particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px bg-red-500/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [1, 2, 1],
                y: [-20, -40, -20]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                delay: Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const NotFoundScreen: React.FC<NotFoundScreenProps> = ({ courseId, onGoHome }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center space-y-12 max-w-lg">
        {/* 404 Visual */}
        <motion.div
          className="relative mx-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4">
            <motion.div
              className="text-6xl font-mono text-white/10"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              404
            </motion.div>

            <motion.div
              className="flex justify-center items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="nf nf-fa-search text-xl text-[#63a1ff]/60"></span>
              <div className="w-8 h-px bg-[#63a1ff]/30"></div>
              <span className="nf nf-cod-question text-xl text-white/30"></span>
            </motion.div>
          </div>

          {/* Floating question marks */}
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10 text-sm"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                opacity: [0, 0.3, 0],
                y: [-10, -30, -10],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 6 + Math.random() * 3,
                delay: Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ?
            </motion.div>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="space-y-3">
            <h1 className="text-3xl text-white font-light">
              Course Not Found
            </h1>
            <p className="text-[var(--friday-mute-color)] leading-relaxed">
              The course you're looking for doesn't exist or has been moved. It might have been deleted or the URL is incorrect.
            </p>
          </div>

          <motion.div
            className="text-xs text-white/30 font-mono tracking-wider bg-white/[0.02] border border-white/10 rounded-sm px-4 py-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            COURSE_ID: {courseId}
          </motion.div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            className="px-6 py-3 bg-[#63a1ff]/10 border border-[#63a1ff]/30 text-[#63a1ff] rounded-sm hover:bg-[#63a1ff]/20 transition-colors"
            onClick={onGoHome}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Browse Courses
          </motion.button>

          <motion.button
            className="px-6 py-3 text-white/50 hover:text-white transition-colors"
            onClick={() => window.history.back()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Enhanced collapsible course navigation
interface CollapsibleCourseNavProps {
  courseData: CourseData;
  selectedModule: Module | null;
  selectedChapter: Chapter | null;
  onSelectModule: (module: Module) => void;
  onSelectChapter: (chapter: Chapter) => void;
  onSelectCourse: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const CollapsibleCourseNav: React.FC<CollapsibleCourseNavProps> = ({
  courseData,
  selectedModule,
  selectedChapter,
  onSelectModule,
  onSelectChapter,
  onSelectCourse,
  isExpanded,
  onToggleExpand
}) => {
  const [expandedModules, setExpandedModules] = useState(new Set(['mod_002']));

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const completedModules = courseData.modules.filter(m => m.isCompleted).length;
  const progressPercentage = (completedModules / courseData.modules.length) * 100;

  return (
    <motion.div
      className="fixed right-0 top-0 h-screen flex items-center z-40"
      initial={{ x: 320 }}
      animate={{ x: isExpanded ? 0 : 300 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="relative">
        <motion.button
          className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 w-12 h-20  backdrop-blur-sm flex items-center justify-center group"
          onClick={onToggleExpand}
          whileHover={{ backgroundColor: "rgba(0,0,0,0.8)", x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="nf nf-cod-chevron_left text-sm text-[#63a1ff]/60 group-hover:text-[#63a1ff]"
            animate={{ rotate: isExpanded ? 180 : 0 }}
          />

          <motion.div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-px h-8 bg-[#63a1ff]/40"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: isExpanded ? 1 : 0 }}
          />
        </motion.button>

        <div className="w-96 h-screen  backdrop-blur-md overflow-y-auto">
          <div className="p-8">
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-1 bg-[linear-gradient(to_right,white,white_50%,transparent_0,transparent)] bg-[length:2px_1px]"></div>
                <span className="text-xs text-[var(--friday-mute-color)] font-mono tracking-wider uppercase">
                  Navigation
                </span>
              </div>

              <div className="space-y-4">
                <motion.button
                  className="text-left group"
                  onClick={() => onSelectCourse()}
                  whileHover={{ x: 1 }}
                >
                  <h2 className="text-lg text-white font-light">
                    {courseData.course.title}
                  </h2>
                  <p className="text-xs text-[var(--friday-mute-color)] mt-2 leading-relaxed">
                    {courseData.course.description.slice(0, 60)}...
                  </p>
                </motion.button>

                <div className="flex items-center gap-6 text-xs text-[var(--friday-mute-color)]">
                  <span>{completedModules}/{courseData.modules.length}</span>
                  <div className="w-px h-3 bg-white/10"></div>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
              </div>

              <div className="mt-6 relative">
                <div className="w-full h-px bg-white/5"></div>
                <motion.div
                  className="absolute top-0 left-0 h-px bg-[#63a1ff]/40"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="space-y-6">
              {courseData.modules.map((module, moduleIndex) => (
                <motion.div
                  key={module._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + moduleIndex * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute -left-6 top-1 text-xs text-[var(--friday-mute-color)] font-mono">
                    {String(moduleIndex + 1).padStart(2, '0')}
                  </div>

                  <motion.button
                    className={`w-full text-left p-3 rounded-sm ${selectedModule?._id === module._id ? 'text-white bg-[#63a1ff]/3' :
                      module.isLocked ? 'text-white/20' : 'text-[var(--friday-mute-color)]'
                      }`}
                    onClick={() => {
                      if (!module.isLocked) {
                        onSelectModule(module);
                        toggleModule(module._id);
                      }
                    }}
                    disabled={module.isLocked}
                    whileHover={!module.isLocked ? { x: 1 } : {}}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 relative">
                        <span className={`nf ${module.icon} text-base`}></span>
                        {module.isCompleted && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-1 h-1 bg-white/60"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 + moduleIndex * 0.1 }}
                          />
                        )}
                        {module.isLocked && (
                          <motion.span
                            className="nf nf-fa-lock absolute -top-1 -right-1 text-[8px] text-white/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-light text-sm mb-2">
                          {module.title}
                        </h3>
                        <p className="text-xs text-[var(--friday-mute-color)] leading-relaxed">
                          {module.description.slice(0, 60)}...
                        </p>

                        <div className="flex items-center gap-4 mt-3 text-xs text-white/20">
                          <span>{courseData.chapters.filter(ch => module.contents.includes(ch._id)).length} chapters</span>
                          <span className="capitalize">
                            {module.isCompleted ? 'complete' :
                              module.isLocked ? 'locked' : 'available'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {expandedModules.has(module._id) && !module.isLocked && (
                      <motion.div
                        className="ml-6 mt-4 space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {courseData.chapters.filter(ch => module.contents.includes(ch._id)).map((chapter, chapterIndex) => (
                          <motion.button
                            key={chapter._id}
                            className={`w-full flex items-center gap-3 text-left py-2 px-3 rounded-sm group/chapter ${selectedChapter?._id === chapter._id
                              ? 'text-white bg-[#63a1ff]/10'
                              : 'text-[var(--friday-mute-color)] hover:text-white'
                              }`}
                            onClick={() => onSelectChapter(chapter)}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: chapterIndex * 0.05 }}
                            whileHover={{
                              x: 2,
                              backgroundColor: "rgba(99, 161, 255, 0.05)"
                            }}
                          >
                            {/* Chapter number */}
                            <span className="text-xs text-white/20 font-mono w-6">
                              {String(chapterIndex + 1).padStart(2, '0')}
                            </span>

                            {/* Enhanced status indicator */}
                            <motion.div
                              className={`w-2 h-2 rounded-full ${chapter.isCompleted ? 'bg-[#63a1ff]/80' :
                                chapter.isActive ? 'bg-[#63a1ff]/50' : 'bg-white/10'
                                }`}
                              whileHover={{ scale: 1.5 }}
                            />

                            <div className="flex-1">
                              <p className="text-sm font-light">
                                {chapter.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-white/20">
                                  {chapter.estimatedTime || '45min'}
                                </span>
                                {chapter.isActive && (
                                  <span className="text-xs text-[#63a1ff]/60">
                                    current
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Enhanced module separator */}
                  {moduleIndex < courseData.modules.length - 1 && (
                    <motion.div
                      className="mt-8 mx-2"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.5 + moduleIndex * 0.1, duration: 0.8 }}
                      style={{ transformOrigin: 'left' }}
                    >
                      <div className="h-px bg-white/5" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface FridayContentAreaProps {
  selectedModule: Module | null;
  selectedChapter: Chapter | null;
  courseData: CourseData;
  isLoading: boolean;
  view: string;
  navExpanded: boolean;
  onSelectModule: (module: Module) => void;
  onSelectChapter: (chapter: Chapter) => void;
}

const FridayContentArea: React.FC<FridayContentAreaProps> = ({
  selectedModule,
  selectedChapter,
  courseData,
  isLoading,
  view,
  navExpanded,
  onSelectModule,
  onSelectChapter
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <EnhancedLoadingScreen onComplete={() => { }} />;
  }

  // Course overview with enhanced design
  if (view === 'course') {
    return (
      <motion.div
        ref={scrollRef}
        className={`flex-1 p-20 overflow-y-auto ${navExpanded ? 'pr-[416px]' : 'pr-20'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Enhanced hero section */}
          <motion.div
            className="mb-40"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-12">
              {/* Course header with icons */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-1 bg-white/20"></div>
                  <span className="text-xs text-[var(--friday-mute-color)] font-mono tracking-wider uppercase">
                    Course Overview
                  </span>
                </div>

                <div className="flex items-start gap-8">
                  <div className="flex-1 space-y-6">
                    <h1 className="text-6xl text-white font-extralight tracking-tight leading-[1.1]">
                      {courseData.course.title}
                    </h1>

                    <p className="text-xl text-[var(--friday-mute-color)] font-light leading-relaxed max-w-4xl">
                      {courseData.course.description}
                    </p>

                    <div className="flex items-center gap-12 text-sm text-white/30">
                      <div className="px-4 py-2 bg-[#63a1ff]/5 border border-[#63a1ff]/20 rounded-sm">
                        {courseData.course.difficultyLevel}
                      </div>
                      <span>{courseData.course.estimatedCompletionTime}h</span>
                      <span>{courseData.modules.length} modules</span>
                    </div>
                  </div>

                  {/* Course icons with minimal flair */}
                  <div className="flex items-center gap-6">
                    {courseData.course.icon.map((iconName, index) => (
                      <motion.div
                        key={iconName}
                        className="relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className={`nf ${iconName} text-4xl text-[#63a1ff]/50 relative`}></span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              {courseData.course.prerequisites.length > 0 && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="text-xs text-white/20 font-mono tracking-wider uppercase">Prerequisites</span>
                  <div className="flex flex-wrap gap-3">
                    {courseData.course.prerequisites.map((prereq, index) => (
                      <motion.span
                        key={prereq}
                        className="px-3 py-1 bg-white/[0.02] border border-white/10 text-sm text-[var(--friday-mute-color)] rounded-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        whileHover={{ backgroundColor: "rgba(99, 161, 255, 0.05)" }}
                      >
                        {prereq}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div
                className="flex items-center gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <span className="text-xs text-white/20 font-mono tracking-wider">TECH STACK</span>
                <div className="h-px flex-1 bg-white/5"></div>
                <div className="flex items-center gap-6">
                  {courseData.course.technologies.map((tech, index) => (
                    <motion.span
                      key={tech}
                      className="text-xs text-[var(--friday-mute-color)] font-light hover:text-[#63a1ff]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="space-y-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            {courseData.modules.map((module, index) => (
              <motion.div
                key={module._id}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                whileHover={!module.isLocked ? { y: -6 } : {}}
                onClick={() => !module.isLocked && onSelectModule(module)}
              >
                <div className="grid grid-cols-12 gap-12 py-16 px-6 rounded-sm hover:bg-[#63a1ff]/[0.01]">
                  <div className="col-span-1 flex items-start justify-center pt-2">
                    <span className="text-xs text-white/20 font-mono">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-start justify-center pt-1">
                    <span className={`nf ${module.icon} text-3xl text-[#63a1ff]/30 group-hover:text-[#63a1ff]/50`} />
                  </div>

                  <div className="col-span-7 space-y-4">
                    <div>
                      <h3 className="text-2xl text-white font-light mb-3 group-hover:text-[#63a1ff]">
                        {module.title}
                      </h3>
                      <p className="text-[var(--friday-mute-color)] leading-relaxed">
                        {module.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-white/20">
                      <span>{courseData.chapters.filter(ch => module.contents.includes(ch._id)).length} chapters</span>
                      <div className="w-px h-3 bg-[linear-gradient(to_bottom,transparent,white,transparent)] bg-[length:1px_4px]"></div>
                      <span className="capitalize">
                        {module.isCompleted ? 'completed' :
                          module.isLocked ? 'locked' : 'available'}
                      </span>
                      <div className="w-px h-3 bg-[linear-gradient(to_bottom,transparent,white,transparent)] bg-[length:1px_4px]"></div>
                      <span>{module.estimatedCompletionTime}h</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-end">
                    {module.isCompleted && (
                      <motion.div
                        className="w-3 h-3 bg-[#63a1ff]/60 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.5 + index * 0.1, type: "spring" }}
                      />
                    )}
                  </div>
                </div>

                {index < courseData.modules.length - 1 && (
                  <motion.div
                    className="mx-12"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1.7 + index * 0.1, duration: 1 }}
                    style={{ transformOrigin: 'left' }}
                  >
                    <div className="h-px bg-[linear-gradient(to_right,transparent,#63a1ff,transparent)] bg-[length:4px_1px] opacity-20" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-40"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
          >
            <div className="grid grid-cols-12 gap-12">
              <div className="col-span-8 space-y-6 p-12 bg-white/[0.01] border border-white/5 rounded-sm relative">
                <motion.div
                  className="absolute top-4 right-4 w-1 h-1 bg-[#63a1ff]/40"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />

                <div className="flex items-center gap-4">
                  <span className="nf nf-oct-cpu text-[#63a1ff]/40"></span>
                  <span className="text-sm text-[var(--friday-mute-color)] font-light">
                    Adaptive Learning System
                  </span>
                </div>

                <p className="text-[var(--friday-mute-color)] leading-relaxed">
                  This system continuously analyzes your learning patterns and adapts content complexity in real-time.
                  Current profile indicates preference for detailed technical explanations with practical implementations.
                </p>

                <div className="text-xs text-white/10 font-mono tracking-wider">
                  PROFILE_TYPE: analytical_learner → detail_oriented → rapid_progression
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Module view with enhanced details
  if (selectedModule && !selectedChapter) {
    return (
      <motion.div
        ref={scrollRef}
        className={`flex-1 p-20 overflow-y-auto ${navExpanded ? 'pr-[416px]' : 'pr-20'}`}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="max-w-5xl mx-auto space-y-20">
          {/* Module header */}
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <motion.span
                className={`nf ${selectedModule.icon} text-5xl text-[#63a1ff]/60`}
                whileHover={{ scale: 1.1 }}
              />
              <div className="flex-1">
                <h1 className="text-4xl text-white font-extralight mb-3">
                  {selectedModule.title}
                </h1>
                <p className="text-[var(--friday-mute-color)] text-lg leading-relaxed">
                  {selectedModule.description}
                </p>

                <div className="flex items-center gap-8 mt-4 text-sm text-white/30">
                  <span className="capitalize">{selectedModule.difficultyLevel}</span>
                  <span>{selectedModule.estimatedCompletionTime}h</span>
                  <span>{courseData.chapters.filter(ch => selectedModule.contents.includes(ch._id)).length} chapters</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced chapters list */}
          <div className="space-y-8">
            {courseData.chapters.filter(ch => selectedModule.contents.includes(ch._id)).map((chapter, index) => (
              <motion.button
                key={chapter._id}
                className="w-full text-left grid grid-cols-12 gap-8 py-8 px-6 rounded-sm hover:bg-[#63a1ff]/[0.03]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelectChapter(chapter)}
                whileHover={{ y: -3 }}
              >
                <div className="col-span-1 flex items-center justify-center">
                  <span className="text-xs text-white/20 font-mono">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="col-span-1 flex items-center justify-center">
                  <motion.div
                    className={`w-3 h-3 rounded-full ${chapter.isCompleted ? 'bg-[#63a1ff]/80' :
                      chapter.isActive ? 'bg-[#63a1ff]/50' : 'bg-white/10'
                      }`}
                    whileHover={{ scale: 1.5 }}
                  />
                </div>

                <div className="col-span-8 space-y-2">
                  <h3 className="text-lg text-white font-light hover:text-[#63a1ff]">
                    {chapter.title}
                  </h3>
                  <p className="text-sm text-[var(--friday-mute-color)]">
                    {chapter.estimatedTime || '45min'}
                  </p>
                </div>

                <div className="col-span-2 flex items-center justify-end">
                  <div className="text-xs text-white/20 text-right space-y-1">
                    {chapter.isCompleted && <div>completed</div>}
                    {chapter.isActive && (
                      <motion.div
                        className="text-[#63a1ff]/80"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        current
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Chapter view with enhanced content
  if (selectedChapter) {
    const content = chapterContent[selectedChapter._id] || selectedChapter;

    return (
      <motion.div
        ref={scrollRef}
        className={`flex-1 p-20 overflow-y-auto ${navExpanded ? 'pr-[416px]' : 'pr-20'}`}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="max-w-5xl mx-auto space-y-24">
          {/* Enhanced chapter header - moved to top */}
          <div className="space-y-8">
            <motion.div
              className="flex items-center gap-6 text-xs text-white/20 tracking-wider"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="font-mono">CHAPTER 03 / 12</span>
              <div className="w-16 h-px bg-[linear-gradient(to_right,transparent,#63a1ff,transparent)] bg-[length:4px_1px]"></div>
              <span>Interactive Learning</span>
            </motion.div>

            <motion.h1
              className="text-5xl text-white font-extralight leading-[1.1]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {content.title}
            </motion.h1>

            <motion.p
              className="text-xl text-[var(--friday-mute-color)] font-light leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {content.description || "Chapter content loading..."}
            </motion.p>

            <motion.div
              className="flex items-center gap-12 text-sm text-white/30"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <span className="nf nf-md-clock_outline text-[#63a1ff]/60"></span>
                <span>{content.estimatedTime || '50 minutes'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="nf nf-cod-terminal text-[#63a1ff]/60"></span>
                <span>Interactive Content</span>
              </div>
            </motion.div>
          </div>

          {/* Enhanced content sections */}
          {content.content && (
            <div className="space-y-24">
              {content.content.map((section, index) => (
                <motion.div
                  key={index}
                  className="space-y-8"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.2 }}
                >
                  {section.type === 'text' && (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-[var(--friday-mute-color)] text-lg leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  )}

                  {section.type === 'code' && (
                    <div className="bg-[#63a1ff]/[0.02] border border-[#63a1ff]/10 p-8 space-y-6 rounded-sm">
                      <div className="flex items-center gap-3 text-xs text-[#63a1ff]/60">
                        <span className="nf nf-dev-code"></span>
                        <span>{section.codeBlockLanguage}</span>
                      </div>
                      <pre className="text-white/80 text-sm leading-relaxed font-mono overflow-x-auto">
                        {section.content}
                      </pre>
                    </div>
                  )}

                  {section.type === 'diagram' && (
                    <div className="bg-white/[0.01] border border-white/10 p-8 space-y-6 rounded-sm">
                      <div className="flex items-center gap-3 text-xs text-white/30">
                        <span className="nf nf-cod-graph"></span>
                        <span>Interactive Diagram</span>
                      </div>
                      <div className="text-[var(--friday-mute-color)] leading-relaxed">
                        <pre className="text-sm">{section.content}</pre>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Enhanced navigation */}
          <motion.div
            className="grid grid-cols-3 items-center pt-20 border-t border-[#63a1ff]/10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              className="flex items-center gap-3 text-white/30 hover:text-[#63a1ff]"
              whileHover={{ x: -3 }}
            >
              <span className="nf nf-cod-arrow_left"></span>
              <span className="text-sm">Previous</span>
            </motion.button>

            <div className="text-center">
              <span className="text-xs text-white/20 font-mono tracking-wider">03 / 12</span>
            </div>

            <motion.button
              className="flex items-center justify-end gap-3 text-white/30 hover:text-[#63a1ff]"
              whileHover={{ x: 3 }}
            >
              <span className="text-sm">Next</span>
              <span className="nf nf-cod-arrow_right"></span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default function CoursePage(): React.ReactElement {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [navExpanded, setNavExpanded] = useState(true);
  const [view, setView] = useState('course');

  const courseId = "683b86d799837ecab0eaac73";

  const loadCourseData = async () => {
    setIsDataLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const response = await fetchCourseData(courseId);

      if (response.success && response.data) {
        setCourseData(response.data);
      } else {
        throw new Error(response.message || 'Failed to load course data');
      }
    } catch (error: any) {
      console.error('Failed to load course data:', error);

      if (error.message === 'COURSE_NOT_FOUND') {
        setNotFound(true);
      } else {
        setError(error.message || 'Unknown error occurred');
      }
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const handleSelectCourse = () => {
    setSelectedModule(null);
    setSelectedChapter(null);
    setView('course');
  };

  const handleSelectModule = (module: Module) => {
    setSelectedModule(module);
    setSelectedChapter(null);
    setView('module');
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsLoading(true);
    setView('chapter');

    setTimeout(() => {
      setIsLoading(false);
    }, 2800);
  };

  const handleRetry = () => {
    loadCourseData();
  };

  const handleGoHome = () => {
    window.location.href = '/courses';
  };

  if (isDataLoading) {
    return (
      <div className="min-h-screen  text-white relative overflow-hidden">
        <MinimalElements />
        <EnhancedLoadingScreen onComplete={() => { }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen  text-white relative overflow-hidden">
        <MinimalElements />
        <NotFoundScreen courseId={courseId} onGoHome={handleGoHome} />
      </div>
    );
  }

  if (error && !courseData) {
    return (
      <div className="min-h-screen  text-white relative overflow-hidden">
        <MinimalElements />
        <ErrorScreen error={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen  text-white relative overflow-hidden">
        <MinimalElements />
        <ErrorScreen error="No course data available" onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-white relative overflow-hidden">
      <MinimalElements />

      <div className="min-h-screen flex">
        <FridayContentArea
          selectedModule={selectedModule}
          selectedChapter={selectedChapter}
          courseData={courseData}
          isLoading={isLoading}
          view={view}
          navExpanded={navExpanded}
          onSelectModule={handleSelectModule}
          onSelectChapter={handleSelectChapter}
        />

        <CollapsibleCourseNav
          courseData={courseData}
          selectedModule={selectedModule}
          selectedChapter={selectedChapter}
          onSelectModule={handleSelectModule}
          onSelectChapter={handleSelectChapter}
          onSelectCourse={handleSelectCourse}
          isExpanded={navExpanded}
          onToggleExpand={() => setNavExpanded(!navExpanded)}
        />
      </div>

      <AnimatePresence>
        {isLoading && (
          <EnhancedLoadingScreen
            onComplete={() => setIsLoading(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
