import { Chapter, CourseData, Module } from "@/types";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

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
  const [expandedModules, setExpandedModules] = useState(new Set([courseData.modules[0]?._id]));

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
          className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 w-12 h-20 backdrop-blur-sm flex items-center justify-center group"
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

        <div className="w-96 h-screen backdrop-blur-md overflow-y-auto">
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
                            <span className="text-xs text-white/20 font-mono w-6">
                              {String(chapterIndex + 1).padStart(2, '0')}
                            </span>

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

export default CollapsibleCourseNav;
