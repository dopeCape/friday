"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PlaceholdersAndVanishTextarea } from "@/components/VanishInput";
import { useRouter } from "next/navigation";
import { CourseList } from "@/components/CourseList";
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

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [input, setInput] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error(`Failed to fetch courses: ${response.status}`);
      const data = await response.json();
      setCourses(data.data?.courses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createLoading) return;
    setCreateLoading(true);
    try {
      const response = await fetch('/api/course/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery: input })
      });
      if (response.ok) {
        const result = await response.json();
        const courseId = result.data.id;
        if (courseId) router.push(`/courses/overview/${courseId}`);
      }
    } catch (err) {
      console.error('Failed to create course:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/overview/${courseId}`);
  };

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
            onClick={fetchCourses}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors underline decoration-dotted"
          >
            try again
          </button>
        </motion.div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="text-center space-y-12 max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="space-y-6">
            <div className="w-20 h-px bg-gray-800 mx-auto"></div>
            <div className="space-y-4">
              <h1 className="text-3xl text-gray-200 font-light">Empty canvas</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Every master started with a single brushstroke.<br />
                What will you create first?
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="text-gray-500 hover:text-blue-400 text-sm transition-colors border-b border-dotted border-gray-700 hover:border-blue-400"
          >
            begin your journey
          </button>

          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full relative pt-8"
            >
              <PlaceholdersAndVanishTextarea
                placeholders={[
                  "Master the art of React development",
                  "Build scalable Node.js applications",
                  "Create beautiful CSS animations",
                  "Learn advanced TypeScript patterns",
                  "Python for data science mastery"
                ]}
                onChange={(e) => setInput(e.target.value)}
                onSubmit={handleCreateCourse}
                isLoading={createLoading}
              />
              <button
                onClick={() => setShowCreateForm(false)}
                className="absolute -top-1 -right-1 text-gray-700 hover:text-gray-500 text-sm w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </motion.div>
          )}
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
        <div className="pt-20 pb-16 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="text-center space-y-6"
          >
            <h1 className="text-5xl text-gray-100 font-light tracking-wider">
              My Courses
            </h1>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto opacity-60"></div>
            <p className="text-gray-600 text-sm">
              {courses.length} course{courses.length !== 1 ? 's' : ''} in your collection
            </p>
          </motion.div>
        </div>

        <div className="flex justify-center pb-20">
          {!showCreateForm ? (
            <motion.button
              onClick={() => setShowCreateForm(true)}
              className="group relative px-8 py-4 border border-dotted border-gray-700 hover:border-blue-400 text-gray-400 hover:text-blue-400 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative flex items-center gap-3">
                <span className="text-sm">+</span>
                Create new course
              </span>
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-2xl relative px-6"
            >
              <PlaceholdersAndVanishTextarea
                placeholders={[
                  "Advanced React patterns and architecture",
                  "Building scalable Node.js microservices",
                  "Modern CSS layout and animation mastery",
                  "TypeScript for enterprise applications",
                  "Python data science and machine learning"
                ]}
                onChange={(e) => setInput(e.target.value)}
                onSubmit={handleCreateCourse}
                isLoading={createLoading}
              />
              <button
                onClick={() => setShowCreateForm(false)}
                className="absolute -top-3 -right-3 text-gray-700 hover:text-gray-500 text-sm w-8 h-8 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </motion.div>
          )}
        </div>

        {/* Use the extracted CourseList component */}
        <CourseList
          courses={courses}
          onCourseClick={handleCourseClick}
          spacing="normal"
          showProgress={true}
        />
      </div>
    </div>
  );
}
