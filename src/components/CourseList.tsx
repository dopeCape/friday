"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Course {
  _id: string;
  title: string;
  description: string;
  isPrivate: boolean;
  icon: string[];
  technologies: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedCompletionTime: number;
  learningObjectives: string[];
  moduleIds: string[];
  progress?: number | { totalModules?: number; completedModules?: number; progressPercentage?: number };
}

interface CourseListProps {
  courses: Course[];
  onCourseClick?: (courseId: string) => void;
  spacing?: 'compact' | 'normal' | 'spacious';
  showProgress?: boolean;
  className?: string;
}

export function CourseList({
  courses,
  onCourseClick,
  spacing = 'normal',
  showProgress = true,
  className = ""
}: CourseListProps) {
  const router = useRouter();
  const spacingMap = {
    compact: 'space-y-16',
    normal: 'space-y-32',
    spacious: 'space-y-48'
  };

  const handleCourseClick = (courseId: string) => {
    if (onCourseClick) {
      onCourseClick(courseId);
    } else {
      router.push(`/courses/overview/${courseId}`);
    }
  };

  return (
    <div className={`px-8 pb-32 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className={spacingMap[spacing]}>
          {courses.map((course, index) => (
            <CourseExhibit
              key={course._id}
              course={course}
              index={index}
              onCourseClick={handleCourseClick}
              showProgress={showProgress}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CourseExhibitProps {
  course: Course;
  index: number;
  onCourseClick: (courseId: string) => void;
  showProgress: boolean;
}

function CourseExhibit({ course, index, onCourseClick, showProgress }: CourseExhibitProps) {
  const router = useRouter();
  const isEven = index % 2 === 0;

  const getProgressPercentage = (progress: any): number => {
    if (typeof progress === 'number') return progress;
    if (progress && typeof progress === 'object') {
      return progress.progressPercentage || 0;
    }
    return 0;
  };

  const progressPercentage = getProgressPercentage(course.progress);

  const handleLearnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/course/${course._id}`);
  };

  return (
    <motion.div
      className="group cursor-pointer"
      onClick={() => onCourseClick(course._id)}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 1,
        delay: index * 0.15,
        ease: [0.23, 1, 0.32, 1]
      }}
      whileHover={{ y: -8 }}
    >
      <div className={`grid grid-cols-12 gap-16 items-center ${!isEven ? 'direction-rtl' : ''}`}>
        <div className={`col-span-12 lg:col-span-7 space-y-8 ${!isEven ? 'lg:order-2 text-right' : 'text-left'}`}>
          <div className="space-y-6">
            {course.icon && course.icon.length > 1 && (
              <div className={`flex gap-3 text-3xl text-gray-600 ${!isEven ? 'justify-end' : 'justify-start'}`}>
                {course.icon.slice(1, 3).map((icon, i) => (
                  <motion.span
                    key={i}
                    className={`nf ${icon} group-hover:text-blue-400 transition-colors`}
                    whileHover={{ scale: 1.05 }}
                  />
                ))}
              </div>
            )}

            <h2 className={`text-3xl lg:text-4xl text-gray-100 font-light group-hover:text-white transition-colors leading-tight ${!isEven ? 'text-right' : 'text-left'}`}>
              {course.title}
            </h2>
          </div>

          <p className={`text-gray-500 leading-relaxed text-lg max-w-xl ${!isEven ? 'text-right ml-auto' : 'text-left'}`}>
            {course.description}
          </p>

          <div className="space-y-6">
            <div className={`flex flex-wrap gap-3 ${!isEven ? 'justify-end' : 'justify-start'}`}>
              {course.technologies?.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="text-xs text-gray-600 px-3 py-2 border border-dotted border-gray-800 hover:border-blue-400 hover:text-blue-400 transition-colors"
                >
                  {tech}
                </span>
              ))}
              {course.technologies && course.technologies.length > 5 && (
                <span className="text-xs text-gray-700 px-3 py-2">
                  +{course.technologies.length - 5} more
                </span>
              )}
            </div>

            <div className={`flex items-center gap-8 text-sm text-gray-600 ${!isEven ? 'justify-end' : 'justify-start'}`}>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                <span className="capitalize">{course.difficultyLevel}</span>
              </div>
              <span className="text-gray-800">·</span>
              <span>{course.estimatedCompletionTime} hours</span>
              <span className="text-gray-800">·</span>
              <span>{course.moduleIds?.length || 0} modules</span>
            </div>

            {showProgress && (
              <div className={`space-y-2 ${!isEven ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center justify-between text-xs text-gray-700 w-32">
                  <span>Progress</span>
                  <span>{Math.floor(progressPercentage)}%</span>
                </div>
                <div className="w-32 h-px bg-gray-900 relative">
                  <motion.div
                    className="h-full bg-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                  />
                </div>
              </div>
            )}
            <div className={`flex ${!isEven ? 'justify-end' : 'justify-start'} pt-2`}>
                <motion.button
                  onClick={handleLearnClick}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-4 py-2 border border-gray-800 rounded-full transition-colors duration-200 group-hover:border-blue-400/50 group-hover:bg-white/5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Start Learning</span>
                  <span className="nf nf-cod-arrow_right transition-transform duration-200 group-hover:translate-x-1"></span>
                </motion.button>
            </div>
          </div>
        </div>

        <div className={`col-span-12 lg:col-span-5 ${!isEven ? 'lg:order-1' : ''}`}>
          <motion.div
            className="relative aspect-[4/3] border border-dotted border-gray-900 group-hover:border-blue-400 transition-colors overflow-hidden flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            {course.icon && course.icon.length > 0 && (
                <motion.span
                    className={`nf ${course.icon[0]} text-8xl text-gray-700 group-hover:text-blue-400 transition-colors`}
                />
            )}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />

            {showProgress && (
              <div className="absolute top-0 left-0 right-0 h-px bg-gray-900">
                <motion.div
                  className="h-full bg-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1.5, delay: index * 0.2 + 0.3 }}
                />
              </div>
            )}

            <motion.div
              className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ y: -2 }}
            >
              <div className="text-xs text-gray-600 flex items-center gap-2">
                <span>{showProgress ? 'Continue learning' : 'View course'}</span>
                <span className="text-blue-400">→</span>
              </div>
            </motion.div>

            {showProgress && (
              <div className="absolute top-6 right-6">
                <div className="flex gap-1">
                  {[...Array(Math.min(course.moduleIds?.length || 0, 8))].map((_, i) => {
                    const totalModules = course.moduleIds?.length || 0;
                    const completedModules = Math.floor((progressPercentage / 100) * totalModules);

                    return (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${i < completedModules ? 'bg-blue-400' : 'bg-gray-800'}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
