"use client"
import React, { useEffect, useState } from 'react';
import { SlideEngine } from '@/components/VideoRenderer/Components';
export default function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [slideData, setSlideData] = useState(null);
  useEffect(() => {
    getSlideData()
  }, [])

  async function getSlideData() {
    const { id: slideId } = await params;
    const response = await fetch(`/api/getSlide/${slideId}`);
    const slideData = await response.json();
    setSlideData(slideData);
  }
  return (
    <div className="w-full h-full flex items-center justify-center" >
      {slideData &&
        <div id="rendered">
          <SlideEngine slideData={slideData} />
        </div>
      }
    </div>
  );
};

