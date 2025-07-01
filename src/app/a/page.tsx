"use client"
import React, { useEffect, useState } from 'react';
import { SlideEngine } from '@/components/VideoRenderer/Components';
export default function Page() {
  const [slideData, setSlideData] = useState(null);
  useEffect(() => {
    fetch("/api/test").then(async data => {
      const slideData = await data.json()
      setSlideData(slideData);

    })
  }, [])
  return (
    <div className="w-full h-full flex items-center justify-center">
      {slideData &&

        <SlideEngine slideData={slideData} />
      }
    </div>
  );
};

