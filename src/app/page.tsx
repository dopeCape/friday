"use client"
import { motion } from "motion/react"
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
export default function Home() {
  return (
    <div className="h-screen w-screen pt-16 relative px-4 sm:px-0 ">
      <div className="absolute w-screen h-screen top-0 z-10">
        <div className="relative w-full overflow-hidden   h-full">
          <FlickeringGrid
            className="relative inset-0  [mask-image:radial-gradient(1800px_circle_at_center,white,transparent)]"
            squareSize={4}
            gridGap={6}
            color="gray"
            maxOpacity={0.5}
            flickerChance={0.1}
          />
        </div>
      </div>
      <div className="h-full w-full overflow-hidden flex flex-col justify-start items-center pt-[200px]">
        <TextAnimation />
        <motion.div
          initial={{ y: "10%", filter: "blur(10px)", opacity: 0 }}
          animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
          transition={{ delay: 1.0, ease: "easeOut", duration: 0.3 }}
          className="z-100"
        >
          <InteractiveHoverButton className="mt-24 bg-white z-100 text-black  mr-8" >
            Try Friday
          </InteractiveHoverButton >
        </motion.div>
      </div>
    </div >
  );
}

function TextAnimation() {
  const heading = "Your Code Is Bad And You Should Feel Bad"
  const subHeading = "But at least our AI teaching assistant won't laugh directly to your face"
  const lastHeadingIndex = heading.split(" ").length - 1;
  return <div className="flex flex-col space-y-8 title">
    <div className="flex gap-3 max-w-[700px] justify-center  flex-wrap z-100">
      {heading.split(" ").map((word, index) => {
        return index === lastHeadingIndex ?
          <motion.span
            key={index}
            className={`text-3xl sm:text-5xl font-bold italic  `}
            initial={{ y: "20%", filter: "blur(10px)", opacity: 0 }}
            animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
            transition={{ delay: index * 0.08, ease: "easeOut", duration: 0.3 }}
          >
            <LineShadowText className="italic" shadowColor={"white"} >
              {word}
            </LineShadowText>
          </motion.span>
          : <motion.span
            key={index}
            className={`text-3xl sm:text-5xl font-extrabold   `}
            initial={{ y: "20%", filter: "blur(10px)", opacity: 0 }}
            animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
            transition={{ delay: index * 0.08, ease: "easeOut", duration: 0.3 }}
          >
            {word}
          </motion.span>
      })}
    </div>
    <div className="flex gap-2 max-w-[800px] justify-center flex-wrap z-100">
      {subHeading.split(" ").map((word, index) => {
        return <motion.span
          key={index}
          className="sm:text-2xl italic"
          initial={{ y: "20%", filter: "blur(10px)", opacity: 0 }}
          animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
          transition={{ delay: 0.3 + (index * 0.08), ease: "easeOut", duration: 0.3 }}
        >
          {word}
        </motion.span>
      })}
    </div>
  </div>
}
