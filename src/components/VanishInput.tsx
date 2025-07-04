"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function PlaceholdersAndVanishTextarea({
  placeholders,
  onChange,
  onSubmit,
  maxLength = 280,
  isLoading = false,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  maxLength?: number;
  isLoading?: boolean;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  };

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [placeholders]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const gridDotsRef = useRef<any[]>([]);

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 140);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const prepareAnimation = useCallback(() => {
    if (!textareaRef.current || !formRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = formRef.current.offsetWidth;
    canvas.height = formRef.current.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const computedStyles = getComputedStyle(textareaRef.current);
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    const paddingLeft = parseFloat(computedStyles.getPropertyValue("padding-left"));
    const paddingTop = parseFloat(computedStyles.getPropertyValue("padding-top"));

    ctx.font = `${fontSize}px ${computedStyles.fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = "#FFF";

    const lines = value.split("\n");
    const lineHeight = fontSize * 1.2;

    lines.forEach((line, index) => {
      ctx.fillText(line, paddingLeft, paddingTop + index * lineHeight);
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    gridDotsRef.current = [];
    const dotSpacing = 20;

    for (let y = 0; y < canvas.height; y += dotSpacing) {
      for (let x = 0; x < canvas.width; x += dotSpacing) {
        gridDotsRef.current.push({
          x,
          y,
          size: 1,
          opacity: 0.1,
          type: 'background',
          active: false,
          delay: Math.random() * 40
        });
      }
    }

    const textDotSpacing = 4;
    for (let y = 0; y < canvas.height; y += textDotSpacing) {
      for (let x = 0; x < canvas.width; x += textDotSpacing) {
        const index = (y * canvas.width + x) * 4;

        if (data[index + 3] > 20) {
          gridDotsRef.current.push({
            x,
            y,
            size: 2,
            opacity: 0.9,
            type: 'text',
            active: false,
            delay: Math.random() * 30,
            fadeSpeed: 0.03 + Math.random() * 0.02
          });
        }
      }
    }
  }, [value]);

  const runAnimation = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let stillAnimating = false;

    gridDotsRef.current.forEach(dot => {
      if (dot.type === 'background') {
        if (!dot.active) {
          dot.delay--;
          if (dot.delay <= 0) {
            dot.active = true;
          }
        }

        if (dot.active && dot.opacity < 0.3) {
          dot.opacity += 0.01;
        }

        if (dot.opacity > 0) {
          ctx.fillStyle = `rgba(100, 100, 100, ${dot.opacity})`;
          ctx.fillRect(dot.x, dot.y, dot.size, dot.size);
          stillAnimating = true;
        }
      }

      if (dot.type === 'text') {
        if (!dot.active) {
          dot.delay--;
          if (dot.delay <= 0) {
            dot.active = true;
          } else {
            ctx.fillStyle = `rgba(220, 220, 220, ${dot.opacity})`;
            ctx.fillRect(dot.x, dot.y, dot.size, dot.size);
            stillAnimating = true;
            return;
          }
        }

        if (dot.active) {
          dot.opacity -= dot.fadeSpeed;

          if (dot.opacity > 0) {
            ctx.fillStyle = `rgba(220, 220, 220, ${dot.opacity})`;
            ctx.fillRect(dot.x, dot.y, dot.size, dot.size);
            stillAnimating = true;
          }
        }
      }
    });

    if (!stillAnimating) {
      setValue("");
      setAnimating(false);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      return;
    }

    animationRef.current = requestAnimationFrame(runAnimation);
  }, []);

  // Reset animating state when loading changes to false
  useEffect(() => {
    if (!isLoading && animating) {
      setAnimating(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isLoading, animating]);

  useEffect(() => {
    autoResizeTextarea();
  }, [value]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey === false && !animating && !isLoading) {
      e.preventDefault();
      vanishAndSubmit();
    }
  };

  const vanishAndSubmit = () => {
    if (animating || !value.trim() || isLoading) return;

    setAnimating(true);

    prepareAnimation();

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(runAnimation);

    if (onSubmit) {
      const formEvent = { preventDefault: () => { } } as React.FormEvent<HTMLFormElement>;
      onSubmit(formEvent);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    vanishAndSubmit();
  };

  // Determine text visibility - separate loading and animation states
  const shouldHideText = isLoading || (animating && !isLoading);

  return (
    <form
      ref={formRef}
      className={cn(
        "w-full relative bg-white dark:bg-[var(--friday-hover)] overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200",
        value && "bg-gray-50"
      )}
      onSubmit={handleSubmit}
    >
      {isLoading && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            {Array.from({ length: 60 }).map((_, i) => {
              const cols = 12;
              const rows = 5;
              const col = i % cols;
              const row = Math.floor(i / cols);
              const x = (col / (cols - 1)) * 90 + 5;
              const y = (row / (rows - 1)) * 80 + 10;

              return (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gray-400 rounded-full"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                  animate={{
                    opacity: [0, 0.7, 0],
                    scale: [0, 1.2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.05,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
            <motion.div
              className="text-sm text-gray-500 font-mono tracking-wider z-10"
              animate={{
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              generating...
            </motion.div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={cn(
          "absolute top-0 left-0 w-full h-full z-20 pointer-events-none",
          !animating ? "opacity-0" : "opacity-100"
        )}
      />

      <textarea
        onChange={(e) => {
          if (!animating && !isLoading) {
            setValue(e.target.value);
            onChange && onChange(e);
          }
        }}
        onKeyDown={handleKeyDown}
        ref={textareaRef}
        value={value}
        maxLength={maxLength}
        rows={4}
        disabled={isLoading}
        className={cn(
          "w-full relative text-sm sm:text-base z-10 border-none dark:text-white bg-transparent text-black focus:outline-none focus:ring-0 pl-4 sm:pl-5 pr-16 py-3 resize-none overflow-auto",
          shouldHideText && "text-transparent dark:text-transparent",
          isLoading && "cursor-wait"
        )}
        style={{
          minHeight: "140px",
          maxHeight: "140px"
        }}
      />

      {!isLoading && (
        <button
          disabled={!value || isLoading}
          type="submit"
          className="absolute right-3 bottom-3 z-50 h-8 w-8 rounded-full disabled:bg-gray-100 bg-black dark:bg-zinc-900 dark:disabled:bg-zinc-800 transition duration-200 flex items-center justify-center"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-300 h-4 w-4"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <motion.path
              d="M5 12l14 0"
              initial={{
                strokeDasharray: "50%",
                strokeDashoffset: "50%",
              }}
              animate={{
                strokeDashoffset: value ? 0 : "50%",
              }}
              transition={{
                duration: 0.3,
                ease: "linear",
              }}
            />
            <path d="M13 18l6 -6" />
            <path d="M13 6l6 6" />
          </motion.svg>
        </button>
      )}

      <div className="absolute inset-0 flex items-start pt-3 pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && !isLoading && (
            <motion.p
              initial={{
                y: 5,
                opacity: 0,
              }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -15,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: "linear",
              }}
              className="dark:text-zinc-500 text-sm sm:text-base font-normal text-neutral-500 pl-4 sm:pl-5 text-left w-[calc(100%-2rem)] truncate"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {maxLength && !isLoading && (
        <div className={`absolute top-2 right-12 text-xs ${value.length > maxLength * 0.8 ? 'text-amber-500' : 'text-gray-400'}`}>
          {value.length}/{maxLength}
        </div>
      )}
    </form>
  );
}
