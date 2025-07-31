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

  const updateModuleStatus = (moduleId: string) => {
    setCourseData((prevCourseData) => {
      if (!prevCourseData) return prevCourseData;

      return {
        ...prevCourseData,
        modules: prevCourseData.modules.map((module) =>
          module._id === moduleId
            ? { ...module, isLocked: false }
            : module
        )
      };
    });

    setSelectedModule((prevModule) => {
      if (prevModule && prevModule._id === moduleId) {
        return {
          ...prevModule,
          isLocked: false,
        };
      }
      return prevModule;
    });
  };

  const updateChapterCompletion = (chapterId: string) => {
    setCourseData((prevCourseData) => {
      if (!prevCourseData) return prevCourseData;

      return {
        ...prevCourseData,
        chapters: prevCourseData.chapters.map((chapter) =>
          chapter._id === chapterId
            ? { ...chapter, isCompleted: true }
            : chapter
        )
      };
    });

    setSelectedChapter((prevChapter) => {
      if (prevChapter && prevChapter._id === chapterId) {
        return {
          ...prevChapter,
          isCompleted: true,
        };
      }
      return prevChapter;
    });
  };

  const updateChapterStatus = (chapterId: string) => {
    setCourseData((prevCourseData) => {
      if (!prevCourseData) return prevCourseData;

      return {
        ...prevCourseData,
        chapters: prevCourseData.chapters.map((chapter) =>
          chapter._id === chapterId
            ? { ...chapter, isLocked: false, isActive: true }
            : { ...chapter, isActive: false } // Deactivate other chapters
        )
      };
    });

    setSelectedChapter((prevChapter) => {
      if (prevChapter && prevChapter._id === chapterId) {
        return {
          ...prevChapter,
          isLocked: false,
          isActive: true,
        };
      }
      return prevChapter;
    });
  };

  const updateModuleCompletion = (moduleId: string) => {
    setCourseData((prevCourseData) => {
      if (!prevCourseData) return prevCourseData;

      return {
        ...prevCourseData,
        modules: prevCourseData.modules.map((module) =>
          module._id === moduleId
            ? { ...module, isCompleted: true }
            : module
        )
      };
    });

    setSelectedModule((prevModule) => {
      if (prevModule && prevModule._id === moduleId) {
        return {
          ...prevModule,
          isCompleted: true,
        };
      }
      return prevModule;
    });
  };


  const updateNavigationState = (updates: {
    completedChapterId?: string;
    completedModuleId?: string;
    unlockedChapterId?: string;
    unlockedModuleId?: string;
    newCurrentChapterId?: string;
  }) => {
    setCourseData((prevCourseData) => {
      if (!prevCourseData) return prevCourseData;
      let updatedData = { ...prevCourseData };

      if (updates.completedModuleId || updates.unlockedModuleId) {
        updatedData.modules = updatedData.modules.map((module) => {
          let updatedModule = { ...module };
          if (updates.completedModuleId && module._id === updates.completedModuleId) {
            updatedModule.isCompleted = true;
          }
          if (updates.unlockedModuleId && module._id === updates.unlockedModuleId) {
            updatedModule.isLocked = false;
          }
          return updatedModule;
        });
      }

      if (updates.completedChapterId || updates.unlockedChapterId || updates.newCurrentChapterId) {
        updatedData.chapters = updatedData.chapters.map((chapter) => {
          let updatedChapter = { ...chapter };

          if (updates.completedChapterId && chapter._id === updates.completedChapterId) {
            updatedChapter.isCompleted = true;
            updatedChapter.isActive = false;
          }

          if (updates.unlockedChapterId && chapter._id === updates.unlockedChapterId) {
            updatedChapter.isLocked = false;
          }

          if (updates.newCurrentChapterId) {
            updatedChapter.isActive = chapter._id === updates.newCurrentChapterId;
          }

          return updatedChapter;
        });
      }

      return updatedData;
    });

    if (updates.completedChapterId) {
      setSelectedChapter((prevChapter) => {
        if (prevChapter && prevChapter._id === updates.completedChapterId) {
          return {
            ...prevChapter,
            isCompleted: true,
            isActive: false
          };
        }
        return prevChapter;
      });
    }

    if (updates.newCurrentChapterId) {
      const newChapter = courseData.chapters.find(c => c._id === updates.newCurrentChapterId);
      if (newChapter) {
        setSelectedChapter(newChapter);
      }
    }
  }; const loadCourseData = async () => {
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
    const parentModule = courseData?.modules.find(m => m.contents.includes(chapter._id));
    if (parentModule) {
      setSelectedModule(parentModule);
    }

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
      setSelectedChapter(chapter); // Fallback to chapter data without content
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    loadCourseData();
  };

  const handleGoHome = () => {
    //TODO: repace with next js router.
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
    <AnimatePresence >
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
            updateModuleStatus={updateModuleStatus}
            updateChapterCompletion={updateChapterCompletion}
            updateChapterStatus={updateChapterStatus}
            updateNavigationState={updateNavigationState}
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

        {isLoading && (
          <EnhancedLoadingScreen
            onComplete={() => { }}
          />
        )}
      </div>

    </AnimatePresence>
  );
}
