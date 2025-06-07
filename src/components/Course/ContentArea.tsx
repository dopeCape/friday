import { useRef } from "react";
import EnhancedLoadingScreen from "./Loading";
import { motion } from "motion/react";
import { Chapter, CourseData, Module } from "@/types";
import ChapterView from "./ChapterView";
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

  if (selectedModule && !selectedChapter) {
    return (
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

  if (selectedChapter) {
    const moduleChapters = courseData.chapters.filter(ch => selectedModule?.contents.includes(ch._id)) || [];
    const currentIndex = moduleChapters.findIndex(ch => ch._id === selectedChapter._id);
    const totalChapters = moduleChapters.length;

    const handlePrevious = currentIndex > 0 ? () => onSelectChapter(moduleChapters[currentIndex - 1]) : undefined;
    const handleNext = currentIndex < totalChapters - 1 ? () => onSelectChapter(moduleChapters[currentIndex + 1]) : undefined;

    return (
      <ChapterView
        chapter={selectedChapter}
        navExpanded={navExpanded}
        onPrevious={handlePrevious}
        onNext={handleNext}
        chapterNumber={currentIndex + 1}
        totalChapters={totalChapters}
      />
    );
  }

  return null;
};



export default FridayContentArea;
