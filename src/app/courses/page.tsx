"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CourseList } from "@/components/CourseList";

interface Course {
  _id: string;
  title: string;
  description: string;
  isPrivate: boolean;
  isSystemGenerated: boolean;
  icon: string[];
  technologies: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedCompletionTime: number;
  learningObjectives: string[];
  moduleIds: string[];
  progress?: {
    totalModules?: number;
    completedModules?: number;
    progressPercentage?: number;
  };
}

export default function CourseBrowsePage() {
  const [templates, setTemplates] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced' | 'expert'>('all');
  const router = useRouter();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error(`Failed to fetch templates: ${response.status}`);
      const data = await response.json();

      if (data.success) {
        console.log(data.data)
        setTemplates(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch templates');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/overview/${courseId}`);
  };

  const filteredTemplates = filter === 'all'
    ? templates
    : templates.filter(template => template.difficultyLevel === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-gray-500 text-2xl tracking-widest"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ···
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-px bg-red-900 mx-auto"></div>
          <div className="space-y-2">
            <p className="text-red-400 text-sm">Connection failed</p>
            <p className="text-gray-600 text-xs max-w-sm">{error}</p>
          </div>
          <button
            onClick={fetchTemplates}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors underline decoration-dotted"
          >
            try again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div
        className="fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '160px 160px',
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="pt-20 pb-16 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl text-gray-100 font-light tracking-wider">
              Browse Courses
            </h1>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto opacity-60"></div>
            <p className="text-gray-600 text-sm">
              Discover {templates.length} courses to accelerate your learning journey
            </p>
          </motion.div>
        </div>

        {/* Filter Controls */}
        <div className="flex justify-center pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <span className="text-gray-600 text-sm">Filter by level:</span>
            <div className="flex gap-2">
              {['all', 'beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level as any)}
                  className={`px-4 py-2 text-xs border border-dotted transition-colors ${filter === level
                    ? 'border-blue-400 text-blue-400 bg-blue-400/10'
                    : 'border-gray-800 text-gray-600 hover:border-blue-400 hover:text-blue-400'
                    }`}
                >
                  {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Results Count */}
        {filter !== 'all' && (
          <div className="text-center pb-8">
            <p className="text-gray-600 text-sm">
              {filteredTemplates.length} {filter} course{filteredTemplates.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Course List */}
        {filteredTemplates.length > 0 ? (
          <CourseList
            courses={filteredTemplates}
            onCourseClick={handleCourseClick}
            spacing="compact"
            showProgress={false}
            className="pt-0"
          />
        ) : (
          <div className="flex items-center justify-center py-32">
            <motion.div
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-px bg-gray-800 mx-auto"></div>
              <div className="space-y-2">
                <p className="text-gray-400 text-lg">
                  {templates.length === 0
                    ? "No courses available"
                    : "No courses match your filter"
                  }
                </p>
                <p className="text-gray-600 text-sm">
                  {templates.length === 0
                    ? "Check back later for new courses"
                    : "Try adjusting your filter or browse all courses"
                  }
                </p>
              </div>
              {filter !== 'all' && templates.length > 0 && (
                <button
                  onClick={() => setFilter('all')}
                  className="text-gray-500 hover:text-blue-400 text-sm transition-colors border-b border-dotted border-gray-700 hover:border-blue-400"
                >
                  show all courses
                </button>
              )}
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
