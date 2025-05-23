import { motion } from "motion/react";

const maskStyle = {
  WebkitMask: "linear-gradient(to left, black 93%, transparent), linear-gradient(to right, black 93%, transparent), linear-gradient(black, black)",
  WebkitMaskComposite: "destination-in",
  mask: "linear-gradient(to left, black 93%, transparent), linear-gradient(to right, black 93%, transparent), linear-gradient(black, black)",
  maskComposite: "exclude"
};

export default function HorizontalDottedLines() {
  return <motion.div
    className="absolute bottom-0 left-[-75px] origin-left !h-[1px] bg-[linear-gradient(to_right,white,white_50%,transparent_0,transparent)] bg-[length:5px_1px]"
    initial={{ width: 0, opacity: 1 }}
    animate={{ width: "calc(100% + 150px)", opacity: 0.2 }}
    transition={{
      duration: 1,
      ease: [0.645, 0.045, 0.355, 1],
      delay: 0.7
    }}
    style={maskStyle}
  />


}

