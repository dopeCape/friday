"use client"
import { useState, useRef, useEffect } from "react";

export default function Page() {
  const HL = 15;

  return (
    <div className="w-screen h-screen px-5 flex overflow-hidden max-w-screen">
      <div className="w-1  bg-white ml-[50%]"></div>

      <div className="flex flex-col  mt-5">
        {Array.from({ length: HL }).map((v, i) => {
          return <div className={`min-h-16 border-white w-[500px] bg-red-400   `} style={{
            transform: `translateX(${i % 2 !== 0 ? "-504px" : "0%"})`
          }} key={i}></div>
        })}

      </div>
    </div>
  );
}
