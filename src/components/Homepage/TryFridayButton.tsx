import { AnimatePresence, motion } from "motion/react";
import VertialDottedLines from "./VerticalDottedLines"
import { PlaceholdersAndVanishTextarea } from "../VanishInput";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'; // Add this import at the top
import { toast } from "sonner"
import z from "zod";
interface ITryFridayProp {
  text: string
  clickHandler: (state: boolean) => void
  isTextBox: boolean;
  disabled: boolean;
}
const placeholders = ["Tell use what you want to learn", "Full stack webdev with Typescript", "Rust from zero to hero"]
export default function TryFriday({ text, clickHandler, isTextBox, disabled }: ITryFridayProp) {
  const [showTextBox, setShowTextBox] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const router = useRouter();


  const handleClick = async () => {
    if (loading) return;
    console.log(input);
    if (!input) return;
    setLoading(true);

    try {
      const response = await fetch("/api/course/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userQuery: input })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
      const result = await response.json();
      const courseId = result.data.id;

      if (courseId) {
        router.push(`/courses/overview/${courseId}`);
      } else {
        throw new Error("Course ID not found in response");
      }

    } catch (error) {
      let errorMessage = "An unexpected error occurred during course generation";
      if (error instanceof z.ZodError) {
        errorMessage = `Validation error: ${error.errors.map(e => e.message).join(', ')}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error("Course generation failed", {
        description: errorMessage
      });
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!isTextBox) {
      setShowTextBox(false);
    } else {
      const timer = setTimeout(() => {
        setShowTextBox(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTextBox]);
  return <>
    <motion.div
      className="dotted-grid"
      animate={{
        width: isTextBox ? "20%" : "35%"
      }}
      transition={{
        width: { duration: 0.6, ease: "easeInOut" }
      }}
    />
    <motion.div
      layout={false}
      className={`text-3xl italic mx-auto relative flex items-center justify-center transition-colors z-0 ${!isTextBox && "hover:bg-[var(--friday-hover)]"} min-w-[30%] ${disabled && "opacity-50 cursor-not-allowed"}`}
      onClick={() => {
        if (disabled) return;
        if (isTextBox) return
        clickHandler(true)
      }}
      animate={{
        width: isTextBox ? "80%" : "30%",
        height: "140px"
      }}
      style={{
        cursor: isTextBox ? "unset" : "pointer",
      }}
      transition={{
        width: { duration: 0.6, ease: "easeInOut" }
      }}
    >
      <AnimatePresence mode="wait">
        {isTextBox ? (
          showTextBox ? (
            <motion.div
              key="textbox"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.645, 0.045, 0.355, 1]
                }
              }}
            >
              <PlaceholdersAndVanishTextarea placeholders={placeholders} onChange={(e) => {
                setInput(() => {
                  return e.target.value
                })
              }} isLoading={loading} onSubmit={handleClick} />
            </motion.div>
          ) : (
            <div aria-hidden="true"></div>
          )
        ) : (
          <motion.p
            key="text"
            initial={{
              opacity: 0,
              filter: "blur(10px)",
              y: "-50%"
            }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              y: 0
            }}
            exit={{
              opacity: 0,
              filter: "blur(10px)",
              transition: {
                duration: 0.6,
                ease: [0.645, 0.045, 0.355, 1]
              }
            }}
            transition={{
              duration: 0.6,
              delay: 0.7,
              ease: [0.645, 0.045, 0.355, 1]
            }}
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
      <VertialDottedLines
        animationDirection="top"
        maskDirection="none"
        delay={0.3}
      />
    </motion.div>
    <motion.div
      className="dotted-grid"
      animate={{
        width: isTextBox ? "20%" : "35%"
      }}
      transition={{
        width: { duration: 0.6, ease: "easeInOut" }
      }}
    />
  </>
}
