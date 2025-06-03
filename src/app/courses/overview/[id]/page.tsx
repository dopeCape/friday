"use client"
import CourseOverview from "@/components/CourseOverview/CourseOverview"
import { motion } from "motion/react"
import { useEffect, useState } from "react"

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourseData() {
      try {
        const resolvedParams = await params;
        const courseId = resolvedParams.id;

        const response = await fetch(`/api/course/${courseId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`404: Course not found`);
          }
          throw new Error(`Failed to fetch course: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch course data');
        }

        if (!data.data?.course) {
          throw new Error('404: Course not found');
        }

        setCourseData({
          course: data.data.course,
          modules: data.data.modules,
          chapters: data.data.chapters
        });
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchCourseData();
  }, [params]);

  // Show "No Course Found" if course data is empty or 404 error
  if (!loading && (!courseData?.course || error?.includes('404'))) {
    return (
      <motion.div
        className="min-h-screen bg-black relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Dotted grid pattern */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, #374151 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '30px 30px'
          }}
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-2xl">
            {/* Animated icon */}
            <motion.div
              className="relative mx-auto w-32 h-32 mb-16"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 1,
                ease: "easeOut",
                delay: 0.3
              }}
            >
              <motion.div
                className="w-full h-full border-2 border-dashed border-gray-600 rounded-2xl flex items-center justify-center"
                animate={{
                  borderColor: ["#4B5563", "#6B7280", "#4B5563"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </motion.svg>
              </motion.div>
            </motion.div>

            <motion.h1
              className="text-5xl font-light text-gray-200 mb-8 tracking-wide"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            >
              Course Not Found
            </motion.h1>

            <motion.p
              className="text-lg text-gray-500 mb-16 leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
            >
              The course you're looking for doesn't exist in our system
            </motion.p>

            {/* Animated buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
            >
              <motion.button
                onClick={() => window.history.back()}
                className="group relative px-8 py-4 border border-dashed border-gray-600 hover:border-gray-400 transition-all duration-300 text-gray-300 hover:text-gray-100 font-light tracking-wide"
                whileHover={{ scale: 1.05, borderColor: "#9CA3AF" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="flex items-center gap-3">
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    whileHover={{ x: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </motion.svg>
                  Go Back
                </span>
              </motion.button>

              <motion.button
                onClick={() => window.location.href = '/courses'}
                className="group relative px-8 py-4 border border-dashed border-gray-600 hover:border-gray-400 transition-all duration-300 text-gray-300 hover:text-gray-100 font-light tracking-wide"
                whileHover={{ scale: 1.05, borderColor: "#9CA3AF" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="flex items-center gap-3">
                  Browse Courses
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show error screen for other errors
  if (error && !error.includes('404')) {
    return (
      <motion.div
        className="min-h-screen bg-black relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Dotted grid pattern */}
        <motion.div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle, #DC2626 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '30px 30px'
          }}
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-2xl">
            {/* Animated error icon */}
            <motion.div
              className="relative mx-auto w-32 h-32 mb-16"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 1,
                ease: "easeOut",
                delay: 0.3
              }}
            >
              <motion.div
                className="w-full h-full border-2 border-dashed border-red-800 rounded-2xl flex items-center justify-center"
                animate={{
                  borderColor: ["#991B1B", "#DC2626", "#991B1B"],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.svg
                  className="w-16 h-16 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </motion.svg>
              </motion.div>
            </motion.div>

            <motion.h1
              className="text-5xl font-light text-gray-200 mb-8 tracking-wide"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            >
              System Error
            </motion.h1>

            <motion.p
              className="text-lg text-gray-500 mb-8 leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
            >
              An unexpected error occurred while loading your course
            </motion.p>

            {/* Error details */}
            <motion.div
              className="mb-16 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="border border-dashed border-red-900 p-6 text-left"
                whileHover={{
                  borderColor: "#DC2626",
                  scale: 1.02
                }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-red-400 text-sm font-mono leading-relaxed opacity-80 break-all">
                  {error}
                </p>
              </motion.div>
            </motion.div>

            {/* Animated buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
            >
              <motion.button
                onClick={() => window.location.reload()}
                className="group relative px-8 py-4 border border-dashed border-red-800 hover:border-red-600 transition-all duration-300 text-red-400 hover:text-red-300 font-light tracking-wide"
                whileHover={{ scale: 1.05, borderColor: "#DC2626" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="flex items-center gap-3">
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </motion.svg>
                  Retry
                </span>
              </motion.button>

              <motion.button
                onClick={() => window.location.href = '/courses'}
                className="group relative px-8 py-4 border border-dashed border-gray-600 hover:border-gray-400 transition-all duration-300 text-gray-400 hover:text-gray-200 font-light tracking-wide"
                whileHover={{ scale: 1.05, borderColor: "#9CA3AF" }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="flex items-center gap-3">
                  Go Home
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="py-[80px]">
      <CourseOverview courseData={courseData} isLoading={loading} />
    </div>
  )
}
