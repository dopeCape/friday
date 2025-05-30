import { motion, useInView, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import HorizontalLine from "../HorizontalLine";
import VertialDottedLines from "../Homepage/VerticalDottedLines";

const renderNerdFontIcon = (hexCode: string) => {
  const cleanHex = hexCode.replace(/^(nf-|u)/i, '');

  const unicodeValue = parseInt(cleanHex, 16);
  return String.fromCharCode(unicodeValue);
};

interface IChapter {
  _id: string;
  title: string;
  isCompleted: boolean;
}

interface IModule {
  _id: string;
  title: string;
  description: string;
  icon: string;
  contents: string[];
  chapters?: IChapter[];
  isLocked: boolean;
  isCompleted: boolean;
  estimatedCompletionTime: number;
}

interface ICourse {
  _id: string;
  title: string;
  description: string;
  icon: string[];
  technologies: string[];
  estimatedCompletionTime: number;
  difficultyLevel: string;
}

interface ICourseOverview {
  courseData: {
    course: ICourse;
    modules: IModule[];
    chapters: IChapter[];
  };
  isLoading?: boolean;
}

const maskStyle = {
  WebkitMask: "linear-gradient(to left, black 93%, transparent), linear-gradient(to right, black 93%, transparent), linear-gradient(black, black)",
  WebkitMaskComposite: "destination-in",
  mask: "linear-gradient(to left, black 93%, transparent), linear-gradient(to right, black 93%, transparent), linear-gradient(black, black)",
  maskComposite: "exclude"
};

const rightMaskStyle = {
  WebkitMask: "linear-gradient(90deg, black 93%, transparent)",
  mask: "linear-gradient(90deg, black 93%, transparent)"
};

const leftMaskStyle = {
  WebkitMask: "linear-gradient(270deg, black 93%, transparent)",
  mask: "linear-gradient(270deg, black 93%, transparent)"
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(5px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const iconVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const lineVariants = {
  hidden: {
    width: 0,
    opacity: 0
  },
  visible: {
    width: "calc(100% + 150px)",
    opacity: 0.2,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const loadingToContentVariants = {
  loading: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  },
  content: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.2
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3 }
  }
};

export default function CourseOverview({ courseData, isLoading = false }: ICourseOverview) {
  console.log(courseData)
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: "-50px 0px -50px 0px"
  });

  const completedModules = courseData?.modules?.filter(m => m.isCompleted).length || 0;
  const totalModules = courseData?.modules?.length || 1;
  const progressPercentage = (completedModules / totalModules) * 100;

  return (
    <motion.div
      ref={ref}
      className="mx-auto text-center max-w-[600px] xl:max-w-[1100px] w-full isolate relative py-[80px] flex flex-col pt-[130px]"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <HorizontalLine top={`0`} right="33.33%" height={"130px"} />
      <HorizontalLine top={`0`} right="66.66%" height={"130px"} />

      <VertialDottedLines
        animationDirection="top"
        maskDirection="none"
        delay={0.3}
      />

      <motion.div
        className="absolute top-[80px] left-[-75px] origin-left !h-[1px] border-t border-dashed border-white/20 z-10"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "calc(100% + 150px)", opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.2
        }}
        style={maskStyle}
      />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingContent key="loading" />
        ) : (
          <ContentSection
            key="content"
            courseData={courseData}
            progressPercentage={progressPercentage}
            completedModules={completedModules}
            totalModules={totalModules}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="absolute bottom-[80px] left-[-75px] origin-left !h-[1px] border-t border-dashed border-white/20 z-10"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "calc(100% + 150px)", opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.4
        }}
        style={maskStyle}
      />
    </motion.div>
  );
}

function LoadingContent() {
  return (
    <motion.div
      variants={loadingToContentVariants}
      initial="loading"
      animate="loading"
      exit="exit"
      className="space-y-16"
    >
      <motion.div
        className="absolute top-[60px] left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-xs text-gray-500"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gray-600 rounded-full"
            animate={{
              width: ["0%", "100%", "0%"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        <span>Loading course...</span>
      </motion.div>

      <div className="grid grid-cols-6 grid-rows-2 relative h-[400px]">
        <motion.div
          className="absolute top-[0px] left-[-75px] origin-left !h-[1px] bg-[linear-gradient(to_right,white,white_50%,transparent_0,transparent)] bg-[length:5px_1px] z-10"
          animate={{
            width: ["0%", "calc(100% + 150px)", "0%"],
            opacity: [0, 0.2, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={maskStyle}
        />

        <div className="row-span-1 col-span-2 relative w-full h-[200px] grid place-items-center">
          <HorizontalLine top={`0`} right="0" height={"200%"} />
          <motion.div
            className="space-y-2"
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-32 h-4 bg-gray-800 rounded"></div>
            <div className="w-24 h-4 bg-gray-800 rounded"></div>
          </motion.div>
        </div>

        <div className="row-span-2 col-span-4 flex text-9xl gap-20 text-gray-700 justify-center items-center dotted-grid relative">
          {[1, 2, 3].map((index) => (
            <motion.div
              key={index}
              className="w-20 h-20 border border-gray-700 rounded-lg"
              animate={{
                borderColor: ["#374151", "#6B7280", "#374151"],
                scale: [0.95, 1, 0.95]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="row-span-1 col-span-2 h-full w-full relative grid place-items-center px-8">
          <motion.div
            className="space-y-2 w-full"
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 0.5
            }}
          >
            <div className="w-full h-2 bg-gray-800 rounded"></div>
            <div className="w-3/4 h-2 bg-gray-800 rounded"></div>
            <div className="w-1/2 h-2 bg-gray-800 rounded"></div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-[0px] left-[-75px] origin-left !h-[1px] bg-[linear-gradient(to_right,white,white_50%,transparent_0,transparent)] bg-[length:5px_1px] z-10"
          animate={{
            width: ["calc(100% + 150px)", "0%", "calc(100% + 150px)"],
            opacity: [0.2, 0, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 1.5,
            ease: "easeInOut"
          }}
          style={maskStyle}
        />
      </div>

      <div className="space-y-8">
        {[1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="grid grid-cols-3 h-[300px] relative"
            animate={{
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: index * 0.5
            }}
          >
            <motion.div
              className="absolute bottom-0 left-[-75px] origin-left !h-[1px] bg-[linear-gradient(to_right,white,white_50%,transparent_0,transparent)] bg-[length:5px_1px] z-10"
              animate={{
                width: ["0%", "calc(100% + 150px)"],
                opacity: [0, 0.1]
              }}
              transition={{
                duration: 2,
                delay: index * 0.3
              }}
              style={maskStyle}
            />

            {index % 2 === 0 ? (
              <>
                <div className="col-span-2 flex justify-center items-center">
                  <div className="w-16 h-16 border border-gray-700 rounded-lg"></div>
                </div>
                <div className="col-span-1 p-6 space-y-3">
                  <div className="space-y-2">
                    <div className="w-3/4 h-3 bg-gray-800 rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-800 rounded"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-gray-800 rounded"></div>
                    <div className="w-5/6 h-2 bg-gray-800 rounded"></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-1 p-6 space-y-3">
                  <div className="space-y-2">
                    <div className="w-3/4 h-3 bg-gray-800 rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-800 rounded"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-gray-800 rounded"></div>
                    <div className="w-5/6 h-2 bg-gray-800 rounded"></div>
                  </div>
                </div>
                <div className="col-span-2 flex justify-center items-center">
                  <div className="w-16 h-16 border border-gray-700 rounded-lg"></div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ContentSection({
  courseData,
  progressPercentage,
  completedModules,
  totalModules
}: {
  courseData: any;
  progressPercentage: number;
  completedModules: number;
  totalModules: number;
}) {
  return (
    <motion.div
      variants={loadingToContentVariants}
      initial="loading"
      animate="content"
      className=""
    >
      <motion.div
        className="absolute top-[40px] left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-xs text-gray-400 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm"
        variants={itemVariants}
      >
        <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ delay: 0.5, duration: 1 }}
          />
        </div>
        <span>{completedModules}/{totalModules} modules</span>
      </motion.div>

      <motion.div
        className="absolute top-[40px] right-[11.33%] hidden lg:block"
        variants={itemVariants}
      >
        <StartButton variant="minimal" />
      </motion.div>

      <CourseTitleSection
        title={courseData.course.title}
        description={courseData.course.description}
        icon={courseData.course.icon}
        technologies={courseData.course.technologies}
        difficultyLevel={courseData.course.difficultyLevel}
        estimatedTime={courseData.course.estimatedCompletionTime}
      />

      <motion.div
        className="absolute right-[-120px] top-[300px] transform -translate-y-1/2 hidden xl:flex flex-col gap-4 text-right text-xs text-gray-500"
        variants={itemVariants}
      >
        <div className="bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm">
          <div className="text-primary font-mono text-lg">{courseData.chapters.length}</div>
          <div>Chapters</div>
        </div>
        <div className="bg-black/30 px-3 py-2 rounded-lg backdrop-blur-sm">
          <div className="text-primary font-mono text-lg">{courseData.course.estimatedCompletionTime}h</div>
          <div>Duration</div>
        </div>
      </motion.div>

      <motion.div
        className="w-[33.4%] relative mx-auto h-[50px]"
        variants={itemVariants}
      >
        <VertialDottedLines animationDirection="top" maskDirection="none" delay={0.8} />
      </motion.div>
      <ModulesSection modules={courseData.modules} chapters={courseData.chapters} />
      <motion.div
        className="w-[33.4%] relative mx-auto h-[50px]"
        variants={itemVariants}
      >
        <VertialDottedLines animationDirection="top" maskDirection="none" delay={0.8} />
        <motion.div
          className="absolute bottom-0 left-[-120%] origin-left !h-[1px] border-t border-dashed border-white/20 z-10"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "calc(300% + 150px)", opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2
          }}
          style={maskStyle}
        />
      </motion.div>
      <motion.div
        className=" relative"
        variants={itemVariants}
      >
        <div className="text-center py-12">
          <motion.h3
            className="text-2xl font-bold mb-4"
            variants={itemVariants}
          >
            Ready to start your journey?
          </motion.h3>
          <motion.p
            className="text-gray-400 mb-8 max-w-md mx-auto"
            variants={itemVariants}
          >
            Stop Googling basic syntax. Start building like the developer you want to become.
          </motion.p>
          <StartButton variant="full" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function StartButton({ variant }: { variant: 'minimal' | 'full' }) {
  if (variant === 'minimal') {
    return (
      <motion.button
        className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-200"
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>Start Learning</span>
        <motion.span
          className="text-primary"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.span>
      </motion.button>
    );
  }

  return (
    <motion.button
      className="group relative overflow-hidden bg-transparent border border-gray-600 hover:border-primary px-8 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:bg-primary/5"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        layoutId="button-bg"
      />
      <span className="relative flex items-center gap-2">
        Get started
        <motion.span
          className="text-primary"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ↗
        </motion.span>
      </span>
    </motion.button>
  );
}

function CourseTitleSection({
  title,
  description,
  icon,
  technologies,
  difficultyLevel,
  estimatedTime
}: {
  title: string;
  description: string;
  icon: string[];
  technologies: string[];
  difficultyLevel: string;
  estimatedTime: number;
}) {
  return (
    <motion.div
      className="grid grid-cols-6 grid-rows-2 relative "
      variants={itemVariants}
    >
      <motion.div
        className="absolute top-0 left-[-75px] origin-left !h-[1px] border-t border-dashed border-white/20 z-10"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "calc(100% + 150px)", opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.4
        }}
        style={maskStyle}
      />
      <motion.div
        className="absolute bottom-[0px] left-[-75px] origin-left !h-[1px] border-t border-dashed border-white/20 z-10"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "calc(100% + 150px)", opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.1
        }}
        style={maskStyle}
      />

      <motion.div
        className="row-span-1 col-span-2 relative w-full text-3xl sm:text-4xl lg:text-5xl text-left px-4 sm:px-8 h-[200px] grid place-items-center"
        variants={itemVariants}
      >
        <HorizontalLine top={`0`} right="0" height={"200%"} />
        <motion.div

          className="absolute bottom-[0px] left-[-75px] origin-left !h-[1px] border-t border-dashed border-white/20 z-10"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "calc(100% + 75px)", opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.4
          }}
          style={leftMaskStyle}
        />
        <motion.span
          className="hover:text-gray-300 transition-colors duration-300 leading-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {title}
        </motion.span>
      </motion.div>

      <motion.div
        className="row-span-2 col-span-4 flex text-6xl sm:text-7xl lg:text-9xl gap-8 sm:gap-12 lg:gap-20 text-primary justify-center items-center dotted-grid relative overflow-hidden"
        variants={itemVariants}
      >
        <motion.div
          className="absolute bottom-[50%] right-[-75px] origin-right !h-[1px] bg-[linear-gradient(to_right,white,white_50%,transparent_0,transparent)] bg-[length:5px_1px] z-10"
          variants={{
            hidden: { width: 0, opacity: 0 },
            visible: {
              width: "75px",
              opacity: 0.2,
              transition: { duration: 0.8, delay: 0.6 }
            }
          }}
          style={rightMaskStyle}
        />

        <motion.div
          className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {icon.map((iconItem, index) => (
          <motion.div
            key={index}
            className="nerd-font relative cursor-pointer"
            variants={iconVariants}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-4 sm:inset-6 lg:inset-8 bg-current rounded-full blur-2xl opacity-5"
              animate={{
                opacity: [0.05, 0.08, 0.05],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: index * 1
              }}
            />
            <span className="relative z-10">{renderNerdFontIcon(iconItem)}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="row-span-1 col-span-2 h-full w-full relative"
        variants={itemVariants}
      >
        <motion.div
          className="h-full w-full grid place-items-center text-left px-4 sm:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="space-y-4 w-full">
            <p className="text-[var(--friday-mute-color)] leading-relaxed text-sm lg:text-base">
              {description.slice(0, 100) + (description.length > 100 ? "..." : "")}
            </p>

            <div className="text-xs text-gray-400 space-y-1">
              <div>{difficultyLevel} • {estimatedTime}h • {technologies.length} technologies</div>
              <div className="text-gray-500">
                {technologies.slice(0, 4).join(' • ')}
                {technologies.length > 4 && ` • +${technologies.length - 4} more`}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ModulesSection({
  modules,
  chapters
}: {
  modules: IModule[];
  chapters: IChapter[];
}) {
  return (
    <motion.div
      className="relative w-full"
      variants={containerVariants}
    >
      <motion.div
        className="absolute top-0 left-[-75px] origin-left !h-[1px] border-t border-dashed border-white/20 z-10"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "calc(100% + 150px)", opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.2
        }}
        style={maskStyle}
      />

      {modules.map((module, index) => (
        <ModuleRow
          key={module._id}
          module={module}
          chapters={chapters.filter(ch => module.contents.includes(ch._id))}
          index={index}
          isEven={index % 2 === 0}
        />
      ))}
    </motion.div>
  );
}

function ModuleRow({
  module,
  chapters,
  index,
  isEven
}: {
  module: IModule;
  chapters: IChapter[];
  index: number;
  isEven: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: "-30px 0px -30px 0px"
  });

  return (
    <motion.div
      ref={ref}
      className="grid grid-cols-3 grid-rows-1 h-[400px] relative group"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: index * 0.05
          }
        }
      }}
    >
      <motion.div
        className="absolute bottom-[0px] left-[-75px] origin-left !h-[1px] bg-[linear-gradient(to_right,white,white_50%,transparent_0,transparent)] bg-[length:5px_1px] z-10"
        variants={lineVariants}
        style={maskStyle}
      />

      {!isEven && <ModuleIcon icon={module.icon} isLocked={module.isLocked} />}

      <ModuleContent
        module={module}
        chapters={chapters}
        isEven={isEven}
      />

      {isEven && <ModuleIcon icon={module.icon} isLocked={module.isLocked} />}

      <HorizontalLine
        top={`0`}
        right={!isEven ? "33.33%" : "66.66%"}
        height={"100%"}
      />
    </motion.div>
  );
}

function ModuleContent({
  module,
  chapters,
  isEven
}: {
  module: IModule;
  chapters: IChapter[];
  isEven: boolean;
}) {
  const [showAllChapters, setShowAllChapters] = useState(false);
  const displayChapters = showAllChapters ? chapters : chapters.slice(0, 4);

  return (
    <motion.div
      className="flex flex-col p-4 lg:p-6 row-span-1 col-span-1 justify-between text-left"
      variants={itemVariants}
    >
      <motion.div
        className="flex flex-col gap-2 py-5"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.2
            }
          }
        }}
      >
        {displayChapters.map((chapter, chapterIndex) => (
          <motion.div
            key={chapter._id}
            className="flex items-center gap-3 group/chapter cursor-pointer"
            variants={{
              hidden: { opacity: 0, x: 0 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.4 }
              }
            }}
            whileHover={{ x: isEven ? 3 : -3 }}
          >
            <motion.div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${chapter.isCompleted
                ? 'bg-green-500'
                : 'bg-primary/50 group-hover/chapter:bg-primary'
                }`}
            />
            <p className="text-primary text-sm group-hover/chapter:text-white transition-colors duration-200 truncate">
              {chapter.title}
            </p>
          </motion.div>
        ))}

        {chapters.length > 4 && (
          <motion.button
            className="text-xs text-gray-600 hover:text-gray-400 ml-5 text-left flex items-center gap-1"
            onClick={() => setShowAllChapters(!showAllChapters)}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            whileHover={{ x: 2 }}
          >
            {showAllChapters ? '← Show less' : `+${chapters.length - 4} more chapters`}
          </motion.button>
        )}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 mb-2">
          <motion.h3
            className={`text-xl lg:text-2xl font-bold transition-colors duration-300 ${module.isLocked ? 'text-gray-500' : 'text-white group-hover:text-primary'
              }`}
            whileHover={{ scale: 1.01 }}
          >
            {module.title}
          </motion.h3>
          {module.isLocked && (
            <span className="text-[10px] text-gray-500">locked</span>
          )}
        </div>

        <p className={`text-sm leading-relaxed ${module.isLocked ? 'text-gray-600' : 'text-[var(--friday-mute-color)]'
          }`}>
          {module.description.length > 120 ? `${module.description.slice(0, 120)}...` : module.description.slice(0, 120)}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 bg-primary rounded-full"></span>
            {chapters.length} chapters
          </span>
          <span>•</span>
          <span>{module.estimatedCompletionTime}h</span>
          <span>•</span>
          <span>{module.isCompleted ? 'completed' : 'in progress'}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ModuleIcon({
  icon,
  isLocked
}: {
  icon: string;
  isLocked: boolean;
}) {
  return (
    <motion.div
      className="nerd-font w-full h-full dotted-grid row-span-1 col-span-2 grid place-items-center text-primary text-9xl relative cursor-pointer group"
      variants={iconVariants}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      style={{
        filter: isLocked ? 'grayscale(1) opacity(0.4)' : 'none'
      }}
    >
      <motion.div
        className="absolute inset-16 bg-current rounded-full blur-2xl opacity-5"
        animate={{
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {isLocked && (
        <motion.div
          className="absolute top-4 right-4 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="nf-fa-lock"></span>
        </motion.div>
      )}

      <span className="relative z-10 group-hover:scale-105 transition-transform duration-200">
        {renderNerdFontIcon(icon)}
      </span>
    </motion.div>
  );
}
