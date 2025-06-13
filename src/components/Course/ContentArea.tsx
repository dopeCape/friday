import { useRef, useState } from "react";
import EnhancedLoadingScreen from "./Loading";
import { motion, AnimatePresence } from "motion/react";
import { Chapter, CourseData, Module } from "@/types";
import ChapterView from "./ChapterView";
import { toast } from "sonner";

interface FridayContentAreaProps {
  selectedModule: Module | null;
  selectedChapter: Chapter | null;
  courseData: CourseData;
  isLoading: boolean;
  view: string;
  navExpanded: boolean;
  onSelectModule: (module: Module) => void;
  onSelectChapter: (chapter: Chapter) => void;
  updateModuleStatus: (moduleId: string) => void;
  updateChapterCompletion: (chapterId: string) => void;
  updateChapterStatus: (chapterId: string) => void;
  updateNavigationState: (updates: {
    completedChapterId?: string;
    completedModuleId?: string;
    unlockedChapterId?: string;
    unlockedModuleId?: string;
    activeChapterId?: string;
    newCurrentChapterId?: string;
  }) => void;
}

const FridayContentArea: React.FC<FridayContentAreaProps> = ({
  selectedModule,
  selectedChapter,
  courseData,
  isLoading,
  view,
  navExpanded,
  onSelectModule,
  onSelectChapter,
  updateNavigationState
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [navigationLoading, setNavigationLoading] = useState(false);

  const handleNext = async (): Promise<void> => {
    if (!selectedChapter || !selectedModule) return;

    try {
      const moduleChapters = courseData.chapters.filter(ch => selectedModule.contents.includes(ch._id));
      const currentIndex = moduleChapters.findIndex(ch => ch._id === selectedChapter._id);
      const nextChapter = moduleChapters[currentIndex + 1];

      const isLastChapter = currentIndex === moduleChapters.length - 1;

      if (nextChapter && !nextChapter.isLocked && !isLastChapter) {
        console.log('🔄 Direct navigation - next chapter already unlocked');

        updateNavigationState({
          completedChapterId: selectedChapter._id,
          newCurrentChapterId: nextChapter._id
        });

        setTimeout(() => {
          const updatedNextChapter = courseData.chapters.find(ch => ch._id === nextChapter._id);
          if (updatedNextChapter) {
            onSelectChapter(updatedNextChapter);
            toast.success("Progress saved! Moving to next chapter.");
          }
        }, 50);

        return;
      }

      console.log('📡 Making API call - chapter locked or module boundary');
      setNavigationLoading(true);

      const response = await fetch(`/api/course/${courseData.course._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chapterId: selectedChapter._id,
          moduleId: selectedModule._id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const {
        nextChapterId,
        nextModuleId,
        moduleCompleted,
        courseCompleted,
        currentChapterId
      } = responseData.data;

      const nextChapterFromResponse = courseData.chapters.find(ch => ch._id === nextChapterId);
      const wasNextChapterLocked = nextChapterFromResponse?.isLocked || false;

      const stateUpdates: any = {
        completedChapterId: currentChapterId
      };

      if (moduleCompleted && selectedModule) {
        stateUpdates.completedModuleId = selectedModule._id;
      }

      if (nextModuleId) {
        stateUpdates.unlockedModuleId = nextModuleId;
      }

      if (nextChapterId) {
        stateUpdates.unlockedChapterId = nextChapterId;

        stateUpdates.newCurrentChapterId = nextChapterId;
      }

      updateNavigationState(stateUpdates);

      if (courseCompleted) {
        toast.success("🎉 Congratulations! Course completed!");
        return;
      }

      setTimeout(() => {
        if (moduleCompleted && nextModuleId) {
          const nextModule = courseData.modules.find(m => m._id === nextModuleId);
          if (nextModule) {
            onSelectModule(nextModule);
            toast.success(`✅ Module completed! Moving to: ${nextModule.title}`);
          }
        }

        if (nextChapterId) {
          const updatedNextChapter = courseData.chapters.find(ch => ch._id === nextChapterId);
          if (updatedNextChapter) {
            onSelectChapter(updatedNextChapter);

            if (wasNextChapterLocked) {
              toast.success("New chapter unlocked! Moving to next chapter.");
            } else if (moduleCompleted) {
            } else {
              toast.success("Progress saved! Moving to next chapter.");
            }
          }
        } else if (!courseCompleted) {
          toast.success("Chapter completed! You're at the end of this module.");
        }
      }, 100);

    } catch (error) {
      console.error('Navigation error:', error);
      let errorMessage = "Failed to navigate to next chapter";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error("Navigation failed", {
        description: errorMessage
      });
    } finally {
      setNavigationLoading(false);
    }
  };

  const handlePrevious = (): void => {
    if (!selectedModule || !selectedChapter) return;

    const moduleChapters = courseData.chapters.filter(ch => selectedModule.contents.includes(ch._id));
    const currentIndex = moduleChapters.findIndex(ch => ch._id === selectedChapter._id);

    if (currentIndex > 0) {
      onSelectChapter(moduleChapters[currentIndex - 1]);
    }
  };

  const NavigationLoader = () => (
    <AnimatePresence>
      {navigationLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative flex flex-col items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative">
              <div className="w-16 h-16 border border-white/[0.08] rounded-full" />

              <motion.div
                className="absolute inset-0 w-16 h-16"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <svg className="w-full h-full" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="30"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="60 140"
                    className="opacity-60"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#63a1ff" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#63a1ff" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-1 h-1 bg-[#63a1ff]/60 rounded-full" />
              </motion.div>
            </div>

            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div
                className="flex items-center gap-2 text-xs text-white/40 font-mono tracking-wider"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-1 h-1 bg-white/20"></div>
                <span className="uppercase">Updating</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return <EnhancedLoadingScreen onComplete={() => { }} />;
  }

  if (view === 'course') {
    return (
      <>
        <motion.div
          ref={scrollRef}
          className={`flex-1 p-20 overflow-y-auto ${navExpanded ? 'pr-[416px]' : 'pr-20'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="mb-40"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-12">
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
                      <div className="relative">
                        <span className={`nf ${module.icon} text-3xl text-[#63a1ff]/30 group-hover:text-[#63a1ff]/50`} />
                        {module.isLocked && (
                          <span className="nf nf-fa-lock absolute -top-1 -right-1 text-[10px] text-white/40" />
                        )}
                      </div>
                    </div>

                    <div className="col-span-7 space-y-4">
                      <div>
                        <h3 className={`text-2xl font-light mb-3 ${module.isLocked
                          ? 'text-white/40 line-through decoration-white/20'
                          : 'text-white group-hover:text-[#63a1ff]'
                          }`}>
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
          </div>
        </motion.div>
        <NavigationLoader />
      </>
    );
  }

  if (selectedModule && !selectedChapter) {
    return (
      <>
        <motion.div
          ref={scrollRef}
          className={`flex-1 p-20 overflow-y-auto ${navExpanded ? 'pr-[416px]' : 'pr-20'}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="max-w-5xl mx-auto space-y-20">
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
            <div className="space-y-8">
              {courseData.chapters.filter(ch => selectedModule.contents.includes(ch._id)).map((chapter, index) => (
                <motion.button
                  key={chapter._id}
                  className={`w-full text-left grid grid-cols-12 gap-8 py-8 px-6 rounded-sm cursor-pointer ${chapter.isLocked
                    ? 'hover:bg-[#63a1ff]/[0.01] opacity-60'
                    : 'hover:bg-[#63a1ff]/[0.03]'
                    }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onSelectChapter(chapter)}
                  whileHover={{ y: chapter.isLocked ? -1 : -3 }}
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-xs text-white/20 font-mono">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="relative">
                      <motion.div
                        className={`w-3 h-3 rounded-full ${chapter.isCompleted ? 'bg-[#63a1ff]/80' :
                          chapter.isActive ? 'bg-[#63a1ff]/50' :
                            chapter.isLocked ? 'bg-white/5' : 'bg-white/10'
                          }`}
                        whileHover={{ scale: chapter.isLocked ? 1 : 1.5 }}
                      />
                      {chapter.isLocked && (
                        <motion.span
                          className="nf nf-fa-lock absolute -top-1 -right-1 text-[8px] text-white/40"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-span-8 space-y-2">
                    <h3 className={`text-lg font-light ${chapter.isLocked
                      ? 'text-white/40 line-through decoration-white/20'
                      : 'text-white hover:text-[#63a1ff]'
                      }`}>
                      {chapter.title}
                    </h3>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-[var(--friday-mute-color)]">
                        {chapter.estimatedTime || '45min'}
                      </p>
                      {chapter.isLocked && (
                        <motion.span
                          className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-full"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.4 }}
                        >
                          locked
                        </motion.span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <div className="text-xs text-white/20 text-right space-y-1">
                      {chapter.isCompleted && <div>completed</div>}
                      {chapter.isActive && !chapter.isLocked && (
                        <motion.div
                          className="text-[#63a1ff]/80"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          current
                        </motion.div>
                      )}
                      {chapter.isLocked && (
                        <motion.div
                          className="text-white/30 flex items-center gap-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                        >
                          <span className="nf nf-fa-lock text-[10px]" />
                          <span>locked</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
        <NavigationLoader />
      </>
    );
  }

  if (selectedChapter) {
    const moduleChapters = courseData.chapters.filter(ch => selectedModule?.contents.includes(ch._id)) || [];
    const currentIndex = moduleChapters.findIndex(ch => ch._id === selectedChapter._id);
    const totalChapters = moduleChapters.length;

    const hasPrevious = currentIndex > 0;
    const hasNext = courseData.modules.find(m => m._id === courseData.course.moduleIds.at(-1)).contents.at(-1) !== selectedChapter._id;

    return (
      <>
        <ChapterView
          chapter={selectedChapter}
          navExpanded={navExpanded}
          onPrevious={hasPrevious ? handlePrevious : undefined}
          onNext={hasNext ? handleNext : undefined}
          chapterNumber={currentIndex + 1}
          totalChapters={totalChapters}
        />
        <NavigationLoader />
      </>
    );
  }

  return null;
};

export default FridayContentArea;
