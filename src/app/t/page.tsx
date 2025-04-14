"use client"

import { useState, useRef } from "react";

export default function Page() {
  const HL = 15;
  const [active, setActive] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const handleUpAndDown = (action: string) => {
    if (action === "up") {
      ref.current?.scrollBy({ top: -100, behavior: 'smooth' });
    }
    if (action === "down") {
      ref.current?.scrollBy({ top: 100, behavior: 'smooth' });
    }
  }
  const handleScrollToIdToTop = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return <div className="w-screen h-screen px-5  flex overflow-hidden max-hscreen max-w-screen">
    <div className="flex overflow-y-scroll " ref={ref}>
      <div className="w-1 bg-white ">
      </div>
      <div>
        <div className="flex-col">
          {Array.from({ length: HL }).map((v, i) => {
            return <div className={`w-[800px] h-1 bg-white  mt-16 cursor-pointer `} id={i.toString()} style={{
              opacity: active == null ? 1 : active == i ? 1 : 0
            }} key={i} onClick={() => {
              handleScrollToIdToTop(i.toString())
              setActive(i);
            }}>
            </div>
          })}
        </div>
      </div>
    </div>
    <div className="mr-48  flex gap-8   ml-48">
      <button onClick={() => handleUpAndDown("up")} className="cursor-pointer"> Up</button>
      <button onClick={() => handleUpAndDown("down")} className="cursor-pointer">down</button>
    </div>

  </div>


}
