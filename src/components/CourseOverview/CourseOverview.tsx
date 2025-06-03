import { motion, useInView, AnimatePresence, useScroll, useTransform } from "motion/react";
import { useRef, useState, useEffect } from "react";
import HorizontalLine from "../HorizontalLine";
import VertialDottedLines from "../Homepage/VerticalDottedLines";

function fixIconName(icon: string) {
  return icon
}

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

// Enhanced Morphing Blob positioned toward right side
const EnhancedMorphingBlob = ({ isInLockedZone }: { isInLockedZone: boolean }) => (
  <motion.div
    className="fixed top-1/4 right-[8%] w-96 h-96 pointer-events-none z-0"
    animate={{
      x: [0, 60, -30, 0],
      y: [0, -40, 80, 0],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <motion.div
      className="w-full h-full rounded-full blur-3xl transition-colors duration-1000"
      animate={{
        scale: [1, 1.3, 0.8, 1],
        borderRadius: ["50%", "30%", "60%", "50%"],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        backgroundColor: isInLockedZone ? "#374151" : "#3b82f6",
        opacity: isInLockedZone ? 0.04 : 0.06
      }}
    />

    {/* Secondary blob */}
    <motion.div
      className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full blur-2xl"
      animate={{
        scale: [0.8, 1.2, 0.9, 0.8],
        x: [0, -20, 30, 0],
        y: [0, 15, -20, 0],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        backgroundColor: isInLockedZone ? "#6B7280" : "#60A5FA",
        opacity: isInLockedZone ? 0.03 : 0.04
      }}
    />

    {/* Tertiary blob for more depth */}
    <motion.div
      className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full blur-xl"
      animate={{
        scale: [1, 0.7, 1.1, 1],
        x: [0, 15, -25, 0],
        y: [0, -10, 5, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        backgroundColor: isInLockedZone ? "#9CA3AF" : "#93C5FD",
        opacity: isInLockedZone ? 0.02 : 0.03
      }}
    />
  </motion.div>
);

// Enhanced floating particles with better distribution
const FloatingParticles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {Array.from({ length: 15 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: Math.random() * 3 + 1,
          height: Math.random() * 3 + 1,
          backgroundColor: `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`
        }}
        animate={{
          y: [0, -120, 0],
          opacity: [0, 0.8, 0],
          scale: [0.5, 1.2, 0.5],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 10 + Math.random() * 8,
          delay: Math.random() * 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

// Scroll-triggered line animation hook
const useScrollTriggeredLine = (threshold = 0.3) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return { ref, isVisible };
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
  const containerRef = useRef(null);
  const ref = useRef(null);
  const [isInLockedZone, setIsInLockedZone] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const isInView = useInView(ref, {
    once: true,
    amount: 0.1,
    margin: "-50px 0px -50px 0px"
  });

  // Enhanced scroll position monitoring
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      if (!courseData?.modules) return;

      const totalModules = courseData.modules.length;
      const unlockedModules = courseData.modules.filter(m => !m.isLocked).length;
      const lockedThreshold = unlockedModules / totalModules * 0.6;

      setIsInLockedZone(latest > lockedThreshold);
    });

    return unsubscribe;
  }, [scrollYProgress, courseData]);

  const completedModules = courseData?.modules?.filter(m => m.isCompleted).length || 0;
  const totalModules = courseData?.modules?.length || 1;
  const progressPercentage = (completedModules / totalModules) * 100;

  return (
    <motion.div
      ref={containerRef}
      className="mx-auto text-center max-w-[600px] xl:max-w-[1100px] w-full isolate relative py-[80px] flex flex-col pt-[130px]"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {/* Enhanced background effects */}
      <EnhancedMorphingBlob isInLockedZone={isInLockedZone} />
      <FloatingParticles />

      <HorizontalLine top={`0`} right="33.33%" height={"130px"} />
      <HorizontalLine top={`0`} right="66.66%" height={"130px"} />

      <VertialDottedLines
        animationDirection="top"
        maskDirection="none"
        delay={0.3}
      />

      <motion.div
        ref={ref}
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
      {/* Enhanced progress indicator */}
      <motion.div
        className="absolute top-[40px] left-1/2 transform -translate-x-1/2 flex items-center gap-3 text-xs text-gray-400 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
        variants={itemVariants}
      >
        <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
          />
        </div>
        <span className="font-medium">{completedModules}/{totalModules} modules</span>
        <span className="text-primary">•</span>
        <span>{Math.round(progressPercentage)}% complete</span>
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

      {/* Enhanced stats sidebar */}
      <motion.div
        className="absolute right-[-140px] top-[300px] transform -translate-y-1/2 hidden xl:flex flex-col gap-4 text-right text-xs text-gray-500"
        variants={itemVariants}
      >
        <motion.div
          className="bg-black/40 px-4 py-3 rounded-xl backdrop-blur-md border border-white/10"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="text-primary font-mono text-xl font-bold">{courseData.chapters.length}</div>
          <div className="text-gray-400">Chapters</div>
        </motion.div>
        <motion.div
          className="bg-black/40 px-4 py-3 rounded-xl backdrop-blur-md border border-white/10"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="text-primary font-mono text-xl font-bold">{courseData.course.estimatedCompletionTime}h</div>
          <div className="text-gray-400">Duration</div>
        </motion.div>
        <motion.div
          className="bg-black/40 px-4 py-3 rounded-xl backdrop-blur-md border border-white/10"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="text-primary font-mono text-xl font-bold">{courseData.modules.length}</div>
          <div className="text-gray-400">Modules</div>
        </motion.div>
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
            className=" relative cursor-pointer  nf"
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
            <span className={`relative z-10  ${fixIconName(iconItem)}`}></span>
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
  const [isExpanded, setIsExpanded] = useState(false);
  const { ref: lineRef, isVisible: lineVisible } = useScrollTriggeredLine(0.3);
  const { ref: verticalLineRef, isVisible: verticalLineVisible } = useScrollTriggeredLine(0.2);

  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: "-30px 0px -30px 0px"
  });

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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
      {/* Enhanced scroll-triggered line */}
      <motion.div
        ref={lineRef}
        className="absolute bottom-[0px] left-[-75px] origin-left !h-[1px] bg-[linear-gradient(to_right,white,white_50%,transparent_0,transparent)] bg-[length:5px_1px] z-10"
        initial={{ width: 0, opacity: 0 }}
        animate={lineVisible ? {
          width: "calc(100% + 150px)",
          opacity: 0.2
        } : { width: 0, opacity: 0 }}
        transition={{
          duration: 1,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.2
        }}
        style={maskStyle}
      />

      {!isEven && <ModuleIcon icon={module.icon} isLocked={module.isLocked} />}

      <ModuleContent
        module={module}
        chapters={chapters}
        isEven={isEven}
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
      />

      {isEven && <ModuleIcon icon={module.icon} isLocked={module.isLocked} />}

      {/* Enhanced scroll-triggered vertical line */}
      <motion.div
        ref={verticalLineRef}
        className="absolute top-0 border-r border-dashed border-white/20 z-10"
        style={{
          right: !isEven ? "33.33%" : "66.66%",
          height: "100%"
        }}
        initial={{ height: 0, opacity: 0 }}
        animate={verticalLineVisible ? {
          height: "100%",
          opacity: 0.2
        } : { height: 0, opacity: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.1
        }}
      />
    </motion.div>
  );
}

function ModuleContent({
  module,
  chapters,
  isEven,
  isExpanded,
  onToggleExpand
}: {
  module: IModule;
  chapters: IChapter[];
  isEven: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  return (
    <motion.div
      className="flex flex-col p-4 lg:p-6 row-span-1 col-span-1 h-[400px] text-left overflow-hidden"
      variants={itemVariants}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          // Collapsed state - chapters at top, title/description at bottom
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full justify-between"
          >
            {/* Chapters preview at top */}
            <motion.div
              className="space-y-2"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {chapters.slice(0, 4).map((chapter, chapterIndex) => (
                <motion.div
                  key={chapter._id}
                  className="flex items-center gap-3 group/chapter cursor-pointer"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{ x: isEven ? 3 : -3 }}
                >
                  <motion.div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${chapter.isCompleted
                        ? 'bg-green-500'
                        : 'bg-primary/50 group-hover/chapter:bg-primary'
                      }`}
                    whileHover={{ scale: 1.2 }}
                  />
                  <p className="text-primary text-sm group-hover/chapter:text-white transition-colors duration-200 truncate">
                    {chapter.title}
                  </p>
                </motion.div>
              ))}

              {chapters.length > 4 && (
                <motion.button
                  className="text-xs text-gray-600 hover:text-gray-400 ml-5 text-left flex items-center gap-2 group/expand"
                  onClick={onToggleExpand}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    animate={{ rotate: [0, 180, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ↗
                  </motion.span>
                  <span className="group-hover/expand:text-primary transition-colors">
                    +{chapters.length - 4} more chapters
                  </span>
                </motion.button>
              )}
            </motion.div>

            {/* Title and description at bottom */}
            <motion.div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <motion.h3
                  className={`text-xl lg:text-2xl font-bold transition-colors duration-300 ${module.isLocked ? 'text-gray-500' : 'text-white group-hover:text-primary'
                    }`}
                  whileHover={{ scale: 1.01 }}
                >
                  {module.title}
                </motion.h3>
                {module.isLocked && (
                  <motion.span
                    className="text-[10px] text-gray-500 px-2 py-1 bg-gray-800/50 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    locked
                  </motion.span>
                )}
              </div>

              <p className={`text-sm leading-relaxed ${module.isLocked ? 'text-gray-600' : 'text-gray-400'
                }`}>
                {module.description.length > 120 ?
                  `${module.description.slice(0, 120)}...` :
                  module.description
                }
              </p>

              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                <motion.span
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  {chapters.length} chapters
                </motion.span>
                <span>•</span>
                <span>{module.estimatedCompletionTime}h</span>
                <span>•</span>
                <motion.span
                  className={`px-2 py-1 rounded-full text-[10px] ${module.isLocked
                      ? 'bg-gray-600/20 text-gray-500'
                      : module.isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {module.isLocked ? 'locked' : module.isCompleted ? 'completed' : 'in progress'}
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          // Expanded state - minimal chapter list only
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.span
                className="text-sm font-medium text-gray-300 tracking-wide"
                initial={{ x: -10 }}
                animate={{ x: 0 }}
              >
                ALL CHAPTERS
              </motion.span>
              <motion.button
                className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
                onClick={onToggleExpand}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>←</span>
                <span>Back</span>
              </motion.button>
            </div>

            {/* Modern minimal chapter list */}
            <motion.div
              className="flex-1 space-y-1 overflow-y-auto scrollbar-none"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.02 }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {chapters.map((chapter, chapterIndex) => (
                <motion.div
                  key={chapter._id}
                  className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-800/20 transition-all duration-200 cursor-pointer group/chapter border-l-2 border-transparent hover:border-primary/30"
                  variants={{
                    hidden: { opacity: 0, x: -15 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{
                    x: isEven ? 3 : -3,
                    backgroundColor: "rgba(59, 130, 246, 0.05)"
                  }}
                >
                  <motion.div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${chapter.isCompleted
                        ? 'bg-green-400'
                        : 'bg-gray-600 group-hover/chapter:bg-primary'
                      }`}
                    whileHover={{ scale: 1.3 }}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 group-hover/chapter:text-white transition-colors duration-200 truncate">
                      {chapter.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {chapter.isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: chapterIndex * 0.05 }}
                        className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-[8px] text-white">✓</span>
                      </motion.div>
                    )}

                    <motion.span
                      className="text-[10px] text-gray-500 opacity-0 group-hover/chapter:opacity-100 transition-opacity"
                      initial={{ x: -5 }}
                      whileHover={{ x: 0 }}
                    >
                      {String(chapterIndex + 1).padStart(2, '0')}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Minimal progress indicator */}
            <motion.div
              className="mt-4 pt-3 border-t border-gray-800"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-gray-500 tracking-wide">PROGRESS</span>
                <span className="text-[11px] text-primary font-medium">
                  {chapters.filter(ch => ch.isCompleted).length}/{chapters.length}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-0.5">
                <motion.div
                  className="bg-gradient-to-r from-primary to-blue-400 h-0.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(chapters.filter(ch => ch.isCompleted).length / chapters.length) * 100}%`
                  }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      className="nerd-font w-full h-full dotted-grid row-span-1 col-span-2 grid place-items-center text-primary text-9xl relative cursor-pointer group overflow-hidden"
      variants={iconVariants}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      style={{
        filter: isLocked ? 'grayscale(1) opacity(0.4)' : 'none'
      }}
    >
      {/* Enhanced animated background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, ${isLocked ? 'rgba(107, 114, 128, 0.05)' : 'rgba(59, 130, 246, 0.05)'
            } 0%, transparent 70%)`
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.1, 0.3]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Pulsing effect - reverted to original */}
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

      {/* Enhanced lock indicator */}
      {isLocked && (
        <motion.div
          className="absolute top-4 right-4 text-lg text-gray-400 bg-gray-900/80 p-2 rounded-lg backdrop-blur-sm border border-gray-700/50"
          initial={{ opacity: 0, scale: 0, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "backOut" }}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(17, 24, 39, 0.9)" }}
        >
          <span className="nf-fa-lock"></span>
        </motion.div>
      )}

      {/* Main icon with enhanced effects */}
      <motion.span
        className={`relative z-10 transition-all duration-300 ${fixIconName(icon)}`}
        whileHover={{
          scale: 1.05,
          textShadow: isLocked ? "none" : "0 0 20px currentColor",
          filter: isLocked ? "none" : "drop-shadow(0 0 10px currentColor)"
        }}
        animate={!isLocked ? {
          textShadow: [
            "0 0 0px currentColor",
            "0 0 15px currentColor",
            "0 0 0px currentColor"
          ]
        } : {}}
        transition={{
          textShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Enhanced ripple effect */}
      <motion.div
        className="absolute inset-8 border border-primary/10 rounded-full"
        variants={{
          rest: { scale: 0, opacity: 0 },
          hover: {
            scale: [0, 1.5, 2],
            opacity: [0.3, 0.1, 0],
            transition: { duration: 0.8, ease: "easeOut" }
          }
        }}
        initial="rest"
        whileHover="hover"
      />
    </motion.div>
  );
}
