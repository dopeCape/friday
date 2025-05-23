import { motion } from "motion/react";
type DirectionType = "top" | "bottom" | "none"
interface IVerticalDottedLinesProp {
  animationDirection: DirectionType,
  maskDirection: DirectionType,
  classNameL?: string
  classNameR?: string
  delay?: number
}
const getMaskStyleVertical = (maskDirection: DirectionType, animationDirection: DirectionType) => {
  return {
    WebkitMask: maskDirection === "none" ? "none" : `linear-gradient(to ${maskDirection}, black 93%, transparent)`,
    WebkitMaskComposite: maskDirection === "none" ? "none" : "destination-in",
    mask: maskDirection === "none" ? "none" : `linear-gradient(to ${maskDirection}, black 50%, transparent)`,
    maskComposite: maskDirection === "none" ? "none" : "exclude",
    top: animationDirection === "top" ? 0 : "unset",
    bottom: animationDirection === "bottom" ? 0 : "unset",
  }
};

export default function VertialDottedLines({ animationDirection, maskDirection, classNameR, classNameL, delay }: IVerticalDottedLinesProp) {
  return <>
    <motion.div
      className={`absolute left-0 w-[1px] h-full bg-[linear-gradient(180deg,#fff,#fff_50%,transparent_0,transparent)] bg-[length:1px_5px] ${classNameL} `}
      initial={{ height: "0%", opacity: 1 }}
      animate={{ height: "100%", opacity: 0.2 }}
      transition={{
        duration: 0.5,
        ease: [0.645, 0.045, 0.355, 1],
        delay: delay ?? 0.3
      }}
      style={getMaskStyleVertical(maskDirection, animationDirection)}
    />

    <motion.div
      className={`absolute right-0 w-[1px] h-full bg-[linear-gradient(180deg,#fff,#fff_50%,transparent_0,transparent)] bg-[length:1px_5px] ${classNameR}`}
      initial={{ height: "0%", opacity: 1 }}
      animate={{ height: "100%", opacity: 0.2 }}
      transition={{
        duration: 0.5,
        ease: [0.645, 0.045, 0.355, 1],
        delay: delay ?? 0.3,
      }}
      style={getMaskStyleVertical(maskDirection, animationDirection)}
    />
  </>
}

