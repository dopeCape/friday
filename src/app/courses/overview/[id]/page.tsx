"use client"
import CourseOverview from "@/components/CourseOverview/CourseOverview"
import dummyCourseData from "@/lib/dummyData/course"
import { useEffect, useState } from "react"

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);
  useEffect(() => {
    async function fetchCourseData() {
      const response = await fetch(`/api/course/6838defff7b4db3e926c6a36`);
      const data = await response.json();
      setCourseData({ course: data.data.course, modules: data.data.modules, chapters: data.data.chapters });
      setLoading(false);
    }
    fetchCourseData();
  }, [])
  return (
    <div className="py-[80px]">
      <CourseOverview courseData={courseData} isLoading={loading} />
    </div>
  )
}

