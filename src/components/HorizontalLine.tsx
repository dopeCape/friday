import { motion } from "motion/react";
interface IHorziontalLine {
  top: string,
  right: string,
  height: string,
}

export default function HorizontalLine({ top, right, height }: IHorziontalLine) {
  console.log(height)
  return <motion.div
    className="absolute  w-[1px] h-full bg-[linear-gradient(180deg,#fff,#fff_50%,transparent_0,transparent)] bg-[length:1px_5px]"
    initial={{ height: "0%", opacity: 1 }}
    animate={{ height, opacity: 0.2 }}
    style={{
      top,
      right,
      height
    }}
    transition={{
      duration: 1,
      ease: [0.645, 0.045, 0.355, 1],
      delay: 0.3
    }}
  />
}

