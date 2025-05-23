"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TryFriday from "@/components/Homepage/TryFridayButton";
import VertialDottedLines from "@/components/Homepage/VerticalDottedLines";
const maskStyle = {
  WebkitMask: "linear-gradient(to left, black 93%, transparent), linear-gradient(to right, black 93%, transparent), linear-gradient(black, black)",
  WebkitMaskComposite: "destination-in",
  mask: "linear-gradient(to left, black 93%, transparent), linear-gradient(to right, black 93%, transparent), linear-gradient(black, black)",
  maskComposite: "exclude"
};
export default function Home() {
  const [showPromptInput, setShowPromptInput] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const handleChangeSetShow = async (state: boolean) => {
    setShowPromptInput(state);
  }
  return (
    <AnimatePresence
      mode="wait">
      <div className="my-[80px] mx-auto text-center max-w-[600px] xl:max-w-[1100px] w-full  isolate relative">
        <div className="h-16 mx-auto w-[30%] relative" >
          <VertialDottedLines animationDirection="top" maskDirection="top" delay={0.0} />
        </div>

        <motion.div
          className="absolute top-0 left-0 w-[1px] h-full bg-[linear-gradient(180deg,#fff,#fff_50%,transparent_0,transparent)] bg-[length:1px_5px]"
          initial={{ height: "0%", opacity: 1 }}
          animate={{ height: "100%", opacity: 0.2 }}
          transition={{
            duration: 1,
            ease: [0.645, 0.045, 0.355, 1],
            delay: 0.3
          }}
        />

        <motion.div
          className="absolute top-0 right-0 w-[1px] h-full bg-[linear-gradient(180deg,#fff,#fff_50%,transparent_0,transparent)] bg-[length:1px_5px]"
          initial={{ height: "0%", opacity: 1 }}
          animate={{ height: "100%", opacity: 0.2 }}
          transition={{
            duration: 1,
            ease: [0.645, 0.045, 0.355, 1],
            delay: 0.3
          }}
        />
        <TextAnimation />
        <div className="relative w-full flex ">
          <motion.div
            className="absolute bottom-0 left-[-75px] origin-left !h-[1px] bg-[linear-gradient(to_right,white,white_50%,transparent_0,transparent)] bg-[length:5px_1px] z-10"
            initial={{ width: 0, opacity: 1 }}
            animate={{ width: "calc(100% + 150px)", opacity: 0.2 }}
            transition={{
              duration: 0.6,
              ease: [0.645, 0.045, 0.355, 1],
              delay: 0.4
            }}
            style={maskStyle}
          />
          <TryFriday text="Try Friday" clickHandler={handleChangeSetShow} isTextBox={showPromptInput} disabled={false} />
        </div>
        <div className="h-16 mx-auto w-[30%] relative" >
          <VertialDottedLines animationDirection="top" maskDirection="bottom" delay={0.5} />
        </div>
      </div>
    </AnimatePresence>
  );
}

function TextAnimation() {
  const heading = "Your Code Is Bad And You Should Feel Bad";
  const subHeading = "But at least our AI teaching assistant won't laugh directly to your face";
  return (
    <div className="relative px-4 ">
      <div className="relative flex flex-wrap justify-center z-10 text-2xl sm:text-3xl xl:text-6xl font-bold p-6">
        <motion.div
          initial={{
            opacity: 0, y: "-50%",

            filter: "blur(10px)",
          }}
          animate={{
            opacity: 1, y: "0%",

            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.6,
            ease: [0.645, 0.045, 0.355, 1],
            delay: 0.1
          }}
        >
          {heading}

        </motion.div>
        <motion.div
          className="absolute top-0 left-[-75px] origin-left h-[1px] bg-[linear-gradient(to_right,white,white_50%,transparent_0,transparent)] bg-[length:5px_1px]"
          initial={{ width: 0, opacity: 1 }}
          animate={{ width: "calc(100% + 150px)", opacity: 0.2 }}
          transition={{
            duration: 0.6,
            ease: [0.645, 0.045, 0.355, 1],
            delay: 0.1
          }}
          style={maskStyle}
        />

        <motion.div
          className="absolute bottom-0 left-[-75px] origin-left h-[1px] bg-[linear-gradient(to_right,white,white_50%,transparent_0,transparent)] bg-[length:5px_1px]"
          initial={{ width: 0, opacity: 1 }}
          animate={{ width: "calc(100% + 150px)", opacity: 0.2 }}
          transition={{
            duration: 0.6,
            ease: [0.645, 0.045, 0.355, 1],
            delay: 0.2
          }}
          style={maskStyle}
        />
      </div>

      <div className="relative text-lg sm:text-xl xl:text-3xl text-center text-gray-400 p-6 mt-4">
        <motion.div
          initial={{
            opacity: 0, y: "-50%",

            filter: "blur(10px)",
          }}
          animate={{
            opacity: 1,

            filter: "blur(0px)",
            y: "0%"
          }}
          transition={{
            duration: 0.6,
            ease: [0.645, 0.045, 0.355, 1],
            delay: 0.4
          }}
        >
          {subHeading}

        </motion.div>
        <motion.div
          className="absolute bottom-0 left-[-75px] origin-left h-[1px] bg-[linear-gradient(to_right,white,white_50%,transparent_0,transparent)] bg-[length:5px_1px]"
          initial={{ width: 0, opacity: 1 }}
          animate={{ width: "calc(100% + 150px)", opacity: 0.2 }}
          transition={{
            duration: 0.6,
            ease: [0.645, 0.045, 0.355, 1],
            delay: 0.3
          }}
          style={maskStyle}
        />
      </div>
    </div>
  );
}
