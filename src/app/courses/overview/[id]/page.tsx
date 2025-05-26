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
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);

  }, [])
  return (
    <div className="py-[80px]">
      <CourseOverview courseData={dummyCourseData} isLoading={loading} />
    </div>
  )
}

