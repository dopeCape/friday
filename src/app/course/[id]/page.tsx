"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import EnhancedLoadingScreen from "@/components/Course/Loading";
import { Chapter, Module, CourseData } from "@/types";
import CollapsibleCourseNav from "@/components/Course/CourseNavbar";
import { ChapterErrorScreen as ErrorScreen, ChapterNotFoundScreen as NotFoundScreen } from "@/components/Course/ErrorScreen";
import FridayContentArea from "@/components/Course/ContentArea";


interface ApiResponse {
  success: boolean;
  data: CourseData;
  message?: string;
}

interface ChapterApiResponse {
  success: boolean;
  data: Chapter;
  message?: string;
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

const fetchChapterContent = async (chapterId: string): Promise<ChapterApiResponse> => {
  try {
    const response = await fetch(`/api/chapters/${chapterId}/`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CHAPTER_NOT_FOUND');
      }
      throw new Error('Failed to fetch chapter content');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching chapter content:', error);
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



export default function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [navExpanded, setNavExpanded] = useState(true);
  const [view, setView] = useState('course');

  const loadCourseData = async () => {
    const { id: courseId } = await params;
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
  }, []);

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

  const handleSelectChapter = async (chapter: Chapter) => {
    setIsLoading(true);
    setView('chapter');
    try {
      const response = await fetchChapterContent(chapter._id);
      if (response.success && response.data) {
        setSelectedChapter(response.data);
      } else {
        throw new Error(response.message || 'Failed to load chapter content');
      }
    } catch (error: any) {
      console.error('Failed to load chapter content:', error);
      setSelectedChapter(chapter);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    loadCourseData();
  };

  const handleGoHome = () => {
    window.location.href = '/courses';
  };

  if (isDataLoading) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <MinimalElements />
        <EnhancedLoadingScreen onComplete={() => { }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <MinimalElements />
        <NotFoundScreen onGoHome={handleGoHome} />
      </div>
    );
  }

  if (error && !courseData) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <MinimalElements />
        <ErrorScreen error={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen text-white relative overflow-hidden">
        <MinimalElements />
        <ErrorScreen error="No course data available" onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
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
            onComplete={() => { }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
