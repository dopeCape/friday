"use client";
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import TryFriday from "@/components/Homepage/TryFridayButton";
import VertialDottedLines from "@/components/Homepage/VerticalDottedLines";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const maskStyle = {
  WebkitMask: "linear-gradient(to left, black 93%, transparent), linear-gradient(to right, black 93%, transparent), linear-gradient(black, black)",
  WebkitMaskComposite: "destination-in",
  mask: "linear-gradient(to left, black 93%, transparent), linear-gradient(to right, black 93%, transparent), linear-gradient(black, black)",
  maskComposite: "exclude"
};

// Enhanced Magnetic Grid
const MagneticGrid = ({ mouseX, mouseY }) => {
  const gridRef = useRef();

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const dots = grid.querySelectorAll('.grid-dot');
    dots.forEach((dot, index) => {
      const rect = dot.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
      );

      const maxDistance = 150;
      const opacity = Math.max(0, (maxDistance - distance) / maxDistance);
      const magnetism = Math.max(0, (80 - distance) / 80);

      const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
      const pullX = Math.cos(angle) * magnetism * 4;
      const pullY = Math.sin(angle) * magnetism * 4;

      dot.style.opacity = opacity * 0.6 + 0.05;
      dot.style.transform = `translate(${pullX}px, ${pullY}px) scale(${1 + opacity * 1.2})`;
      dot.style.backgroundColor = opacity > 0.3 ? '#3b82f6' : '#ffffff';
      dot.style.filter = opacity > 0.5 ? `blur(0px) drop-shadow(0 0 ${opacity * 12}px #3b82f6)` : 'none';
    });
  }, [mouseX, mouseY]);

  return (
    <div ref={gridRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 120 }).map((_, i) => (
        <div
          key={i}
          className="grid-dot absolute w-0.5 h-0.5 bg-white rounded-full opacity-5 transition-all duration-150 ease-out"
          style={{
            left: `${(i % 12) * 8.33}%`,
            top: `${Math.floor(i / 12) * 10}%`,
          }}
        />
      ))}
    </div>
  );
};

// Floating Words Effect
const FloatingWords = () => {
  const words = ['AI', 'Code', 'Build', 'Ship', 'Learn', 'Create', 'Deploy', 'Debug', 'Scale', 'Iterate'];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {words.map((word, i) => (
        <motion.div
          key={i}
          className="absolute text-blue-500/15 font-medium text-sm"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
            opacity: 0,
            rotate: Math.random() * 20 - 10
          }}
          animate={{
            y: -50,
            opacity: [0, 0.8, 0.8, 0],
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            rotate: Math.random() * 40 - 20
          }}
          transition={{
            duration: Math.random() * 12 + 18,
            delay: Math.random() * 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {word}
        </motion.div>
      ))}
    </div>
  );
};

// Revolutionary Heading Component - Split letters with stagger
const SplitHeading = ({ children, className = "", delay = 0 }) => {
  const letters = children.split('');

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 1 }}
      animate={{
        textShadow: [
          "0 0 0px rgba(255,255,255,0)",
          "0 0 30px rgba(255,255,255,0.1)",
          "0 0 0px rgba(255,255,255,0)"
        ]
      }}
      transition={{
        textShadow: { duration: 6, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      {letters.map((letter, i) => (
        <motion.div
          key={`wrapper-${i}`}
          className="inline-block"
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            y: {
              duration: 4 + i * 0.2,
              delay: delay + i * 0.1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <motion.span
            className="inline-block"
            initial={{
              opacity: 0,
              y: 60,
              rotateX: -90,
              filter: "blur(15px)",
              scale: 0.8
            }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: 0,
              filter: "blur(0px)",
              scale: 1
            }}
            transition={{
              duration: 1.2,
              delay: delay + i * 0.05,
              ease: [0.23, 1, 0.32, 1]
            }}
            whileHover={{
              y: -8,
              scale: 1.05,
              transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
            }}
            style={{ transformOrigin: "center bottom" }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Outlined Heading with depth
const OutlineHeading = ({ children, className = "", delay = 0 }) => (
  <motion.div
    className={`relative ${className}`}
    animate={{
      y: [0, -3, 0],
      textShadow: [
        "0 0 0px rgba(255,255,255,0)",
        "0 0 40px rgba(255,255,255,0.05)",
        "0 0 0px rgba(255,255,255,0)"
      ]
    }}
    transition={{
      y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
      textShadow: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    }}
  >
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.8, rotateX: 15 }}
      whileInView={{
        opacity: 1,
        scale: 1,
        rotateX: 0,
      }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{
        scale: 1.02,
        y: -5,
        textShadow: "0 10px 30px rgba(255,255,255,0.1)",
        transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
      }}
    >
      {/* Shadow layers for depth */}
      <motion.div
        className="absolute inset-0 text-white/3 transform translate-x-2 translate-y-2"
        animate={{
          x: [2, 3, 2],
          y: [2, 3, 2]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>
      <motion.div
        className="absolute inset-0 text-white/8 transform translate-x-1 translate-y-1"
        animate={{
          x: [1, 1.5, 1],
          y: [1, 1.5, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {children}
      </motion.div>

      {/* Main text with outline */}
      <div
        className="relative text-transparent"
        style={{
          WebkitTextStroke: '2px rgba(255, 255, 255, 0.8)',
          textStroke: '2px rgba(255, 255, 255, 0.8)'
        }}
      >
        {children}
      </div>

      {/* Floating accent */}
      <motion.div
        className="absolute -top-2 -right-2 w-2 h-2 bg-blue-400 rounded-full opacity-60"
        animate={{
          scale: [0.8, 1.4, 0.8],
          opacity: [0.4, 1, 0.4],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Additional floating particles */}
      <motion.div
        className="absolute -bottom-1 -left-1 w-1 h-1 bg-blue-300 rounded-full opacity-40"
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.2, 0.8, 0.2],
          x: [0, 2, 0],
          y: [0, -2, 0]
        }}
        transition={{
          duration: 4,
          delay: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  </motion.div>
);

// Pure Floating Content Block - No backgrounds
const FloatingContent = ({ children, className = "", delay = 0 }) => (
  <motion.div
    className={`relative ${className}`}
    initial={{
      opacity: 0,
      y: 50,
      scale: 0.95,
      filter: "blur(5px)"
    }}
    whileInView={{
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)"
    }}
    viewport={{ once: true }}
    transition={{
      duration: 1.5,
      delay,
      ease: [0.23, 1, 0.32, 1]
    }}
    whileHover={{
      y: -12,
      scale: 1.02,
      transition: {
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1]
      }
    }}
    animate={{
      y: [0, -6, 0],
    }}
    transition={{
      y: {
        duration: 12 + delay,
        delay: delay * 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }}
  >
    {children}
  </motion.div>
);

// Typography-based icon
const TypoIcon = ({ symbol, className = "", delay = 0 }) => (
  <motion.div
    className={`text-4xl font-bold text-blue-400 ${className}`}
    initial={{
      opacity: 0,
      scale: 0.3,
      rotateY: -180,
      filter: "blur(10px)"
    }}
    whileInView={{
      opacity: 1,
      scale: 1,
      rotateY: 0,
      filter: "blur(0px)"
    }}
    viewport={{ once: true }}
    transition={{
      duration: 1.4,
      delay,
      ease: [0.23, 1, 0.32, 1]
    }}
    whileHover={{
      scale: 1.3,
      rotate: [0, -8, 8, 0],
      y: -8,
      textShadow: "0 10px 25px rgba(59, 130, 246, 0.4)",
      transition: {
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1],
        rotate: { duration: 0.8 }
      }
    }}
    animate={{
      textShadow: [
        "0 0 0px rgba(59, 130, 246, 0)",
        "0 0 25px rgba(59, 130, 246, 0.3)",
        "0 0 0px rgba(59, 130, 246, 0)"
      ],
      y: [0, -4, 0],
      rotateY: [0, 2, 0, -2, 0]
    }}
    transition={{
      textShadow: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      },
      y: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      },
      rotateY: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }}
  >
    {symbol}
  </motion.div>
);

export default function Home() {
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const smoothMouseY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleChangeSetShow = async (state) => {
    if (!isSignedIn) {
      router.push("/check-login");
      return;
    }
    setShowPromptInput(state);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <MagneticGrid mouseX={mousePosition.x} mouseY={mousePosition.y} />
      <FloatingWords />

      {/* Modern Minimal Cursor with Trail */}
      <motion.div
        className="fixed w-3 h-3 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          left: smoothMouseX,
          top: smoothMouseY,
          translateX: "-50%",
          translateY: "-50%",
          background: "rgba(59,130,246,0.8)"
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Cursor Trail */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-1 h-1 bg-blue-400 rounded-full pointer-events-none z-40 opacity-60"
          style={{
            left: smoothMouseX,
            top: smoothMouseY,
            translateX: "-50%",
            translateY: "-50%"
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Hero Section */}
      <AnimatePresence mode="wait">
        <div className="my-[80px] mx-auto text-center max-w-[600px] xl:max-w-[1100px] w-full isolate relative z-10">
          <div className="h-16 mx-auto w-[30%] relative">
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

          <div className="relative w-full flex">
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
            <TryFriday text="Try Friday" clickHandler={handleChangeSetShow} isTextBox={showPromptInput} disabled={!isLoaded} />
          </div>

          <div className="h-16 mx-auto w-[30%] relative">
            <VertialDottedLines animationDirection="top" maskDirection="bottom" delay={0.5} />
          </div>
        </div>
      </AnimatePresence>

      {/* Revolutionary Learning Section */}
      <section className="px-4 py-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-32">
            <SplitHeading className="text-4xl md:text-7xl font-bold mb-8 leading-tight">
              Learning That
            </SplitHeading>
            <OutlineHeading className="text-4xl md:text-7xl font-bold text-blue-400" delay={1}>
              Feels Like Magic
            </OutlineHeading>
            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mt-12"
              initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 1.5, ease: [0.23, 1, 0.32, 1] }}
            >
              Stop grinding through tutorials that lead nowhere. Start building the future with AI that actually understands how you think.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-20">
            {[
              {
                symbol: "∆",
                title: "Instant Understanding",
                description: "AI that explains concepts the moment you need them, in the context of what you're building"
              },
              {
                symbol: "◊",
                title: "Adaptive Intelligence",
                description: "Every interaction teaches the AI more about your learning style and coding preferences"
              },
              {
                symbol: "○",
                title: "Real Impact",
                description: "Build portfolio-worthy projects that solve actual problems and get you noticed"
              }
            ].map((item, i) => (
              <FloatingContent key={i} delay={i * 0.3} className="text-center">
                <TypoIcon symbol={item.symbol} className="mb-8 mx-auto" delay={i * 0.3} />
                <motion.h3
                  className="text-2xl font-semibold mb-6 text-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.3 + 0.5, duration: 0.6 }}
                >
                  {item.title}
                </motion.h3>
                <motion.p
                  className="text-gray-400 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.3 + 0.7, duration: 0.6 }}
                >
                  {item.description}
                </motion.p>
              </FloatingContent>
            ))}
          </div>
        </div>
      </section>

      {/* Problem-Solution Flow */}
      <section className="px-4 py-32 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.645, 0.045, 0.355, 1] }}
            >
              <SplitHeading className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Tutorial Hell
              </SplitHeading>
              <OutlineHeading className="text-4xl md:text-6xl font-bold text-gray-300 mb-12" delay={0.8}>
                Is Over
              </OutlineHeading>

              <motion.p
                className="text-xl text-gray-300 leading-relaxed mb-16"
                initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 1.2, ease: [0.23, 1, 0.32, 1] }}
              >
                You've watched countless hours of videos, copy-pasted code you didn't understand,
                and still felt lost when trying to build something real. Sound familiar?
              </motion.p>

              <div className="space-y-12">
                {[
                  { pain: "Watching tutorials without building", solution: "Build from day one with guidance" },
                  { pain: "Getting stuck with no help", solution: "AI mentor available 24/7" },
                  { pain: "Learning outdated patterns", solution: "Modern best practices built-in" },
                  { pain: "No portfolio to show", solution: "Ship real projects people use" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="group relative"
                    initial={{ opacity: 0, x: -40, filter: "blur(5px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    viewport={{ once: true }}
                    transition={{
                      delay: i * 0.2 + 1.4,
                      duration: 1.2,
                      ease: [0.23, 1, 0.32, 1]
                    }}
                  >
                    <div className="flex items-center space-x-8">
                      <motion.div
                        className="flex-1 text-gray-400 line-through group-hover:text-red-400 transition-colors duration-700"
                        whileHover={{ x: -5 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                      >
                        {item.pain}
                      </motion.div>
                      <motion.div
                        className="text-blue-400 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        animate={{ x: [0, 8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        →
                      </motion.div>
                      <motion.div
                        className="flex-1 text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                      >
                        {item.solution}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4, ease: [0.645, 0.045, 0.355, 1] }}
            >
              <FloatingContent>
                <div className="space-y-12">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-xl font-medium">Your Journey</span>
                    <motion.span
                      className="text-blue-400 text-2xl"
                      animate={{ rotate: [0, 180, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      ✦
                    </motion.span>
                  </div>

                  <div className="space-y-10">
                    {[
                      "Pick a project you actually want to build",
                      "AI breaks it down into learnable steps",
                      "Code with real-time guidance and explanations",
                      "Deploy something you're proud to show off"
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        className="flex items-start space-x-6 text-gray-300"
                        initial={{ opacity: 0, y: 30, filter: "blur(3px)" }}
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        viewport={{ once: true }}
                        transition={{
                          delay: i * 0.3 + 1,
                          duration: 1,
                          ease: [0.23, 1, 0.32, 1]
                        }}
                      >
                        <motion.div
                          className="w-10 h-10 rounded-full border-2 border-blue-500/30 flex items-center justify-center text-sm font-semibold text-blue-400 mt-1"
                          whileHover={{
                            scale: 1.15,
                            borderColor: "rgba(59, 130, 246, 0.6)",
                            boxShadow: "0 0 25px rgba(59, 130, 246, 0.4)",
                            transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
                          }}
                          animate={{
                            borderColor: [
                              "rgba(59, 130, 246, 0.3)",
                              "rgba(59, 130, 246, 0.5)",
                              "rgba(59, 130, 246, 0.3)"
                            ]
                          }}
                          transition={{
                            borderColor: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                          }}
                        >
                          {i + 1}
                        </motion.div>
                        <div className="flex-1 leading-relaxed text-lg">{step}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </FloatingContent>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technology Constellation */}
      <section className="px-4 py-32 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <SplitHeading className="text-4xl md:text-6xl font-bold mb-8">
              Every Path,
            </SplitHeading>
            <OutlineHeading className="text-4xl md:text-6xl font-bold text-blue-400" delay={0.8}>
              One Platform
            </OutlineHeading>
            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              Whether you dream of building the next unicorn startup or just want to automate your boring job, we've got you covered.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16">
            {[
              {
                symbol: "◉",
                title: "Full-Stack Web",
                desc: "React, Next.js, Node.js, databases - build complete web applications that scale",
                techs: ["React", "TypeScript", "PostgreSQL", "Vercel"]
              },
              {
                symbol: "◈",
                title: "Mobile Native",
                desc: "iOS and Android apps that feel native and perform like butter",
                techs: ["React Native", "Swift", "Kotlin", "Expo"]
              },
              {
                symbol: "◎",
                title: "AI & Machine Learning",
                desc: "Build the future with neural networks, LLMs, and computer vision",
                techs: ["Python", "PyTorch", "OpenAI", "Hugging Face"]
              },
              {
                symbol: "◐",
                title: "Cloud & DevOps",
                desc: "Deploy, scale, and monitor applications that handle millions of users",
                techs: ["AWS", "Docker", "Kubernetes", "Terraform"]
              }
            ].map((path, i) => (
              <FloatingContent key={i} delay={i * 0.2} className="text-center">
                <TypoIcon symbol={path.symbol} className="mb-8 mx-auto" delay={i * 0.2} />
                <motion.h3
                  className="text-xl font-semibold mb-4 text-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 + 0.5 }}
                >
                  {path.title}
                </motion.h3>
                <motion.p
                  className="text-gray-400 text-sm leading-relaxed mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 + 0.7 }}
                >
                  {path.desc}
                </motion.p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {path.techs.map((tech, j) => (
                    <motion.span
                      key={j}
                      className="text-xs px-4 py-2 text-gray-300 border border-white/10 rounded-full hover:border-blue-500/30 hover:text-blue-300 transition-colors"
                      whileHover={{
                        scale: 1.08,
                        y: -4,
                        boxShadow: "0 5px 15px rgba(59, 130, 246, 0.2)",
                        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
                      }}
                      initial={{ opacity: 0, y: 15, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: j * 0.1 + i * 0.3 + 1,
                        duration: 0.8,
                        ease: [0.23, 1, 0.32, 1]
                      }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </FloatingContent>
            ))}
          </div>
        </div>
      </section>

      {/* AI Consciousness */}
      <section className="px-4 py-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-32">
            <SplitHeading className="text-4xl md:text-6xl font-bold mb-8">
              AI That Actually
            </SplitHeading>
            <OutlineHeading className="text-4xl md:text-6xl font-bold text-purple-400" delay={0.8}>
              Gets You
            </OutlineHeading>
            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              This isn't another ChatGPT wrapper. This is AI that learns how you learn, remembers your goals, and guides you toward mastery.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-20">
            {[
              {
                symbol: "◆",
                title: "Reads Your Mind",
                description: "AI analyzes your code patterns, identifies knowledge gaps, and suggests exactly what you need to learn next"
              },
              {
                symbol: "◇",
                title: "Predicts Problems",
                description: "Spots bugs, performance issues, and architectural problems before they become expensive mistakes"
              },
              {
                symbol: "◊",
                title: "Personalizes Everything",
                description: "Adapts explanations, examples, and challenges to match your experience level and learning style"
              }
            ].map((feature, i) => (
              <FloatingContent key={i} delay={i * 0.3} className="text-center">
                <TypoIcon symbol={feature.symbol} className="mb-8 mx-auto" delay={i * 0.3} />
                <motion.h3
                  className="text-2xl font-semibold mb-6 text-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.3 + 0.5 }}
                >
                  {feature.title}
                </motion.h3>
                <motion.p
                  className="text-gray-400 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.3 + 0.7 }}
                >
                  {feature.description}
                </motion.p>
              </FloatingContent>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call */}
      <section className="px-4 py-40 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.645, 0.045, 0.355, 1] }}
          >
            <SplitHeading className="text-4xl md:text-7xl font-bold mb-4 leading-tight">
              Stop Dreaming.
            </SplitHeading>
            <OutlineHeading className="text-4xl md:text-7xl font-bold text-blue-400 mb-12" delay={1}>
              Start Building.
            </OutlineHeading>

            <motion.p
              className="text-xl text-gray-300 mb-20 leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 2 }}
            >
              The developers who thrive in the AI age aren't the ones who know the most—they're the ones who build the most.
              <br /><br />
              Your time is now.
            </motion.p>

            <motion.button
              className="px-16 py-6 bg-white text-black font-semibold rounded-xl text-xl"
              whileHover={{
                scale: 1.08,
                y: -5,
                boxShadow: "0 15px 60px rgba(255,255,255,0.3)",
                transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
              }}
              whileTap={{
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 2.5,
                duration: 1.2,
                ease: [0.23, 1, 0.32, 1]
              }}
              animate={{
                boxShadow: [
                  "0 5px 15px rgba(255,255,255,0.1)",
                  "0 10px 40px rgba(255,255,255,0.2)",
                  "0 5px 15px rgba(255,255,255,0.1)"
                ],
                y: [0, -2, 0]
              }}
              transition={{
                boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              Begin Your Journey
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function TextAnimation() {
  const heading = "Code Like You Mean It";
  const subHeading = "Transform your development skills with personalized AI guidance that adapts to how you learn";

  return (
    <div className="relative px-4">
      <div className="relative flex flex-wrap justify-center z-10 text-2xl sm:text-3xl xl:text-6xl font-bold p-6">
        <motion.div
          initial={{
            opacity: 0,
            y: "-50%",
            filter: "blur(10px)",
          }}
          animate={{
            opacity: 1,
            y: "0%",
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.6,
            ease: [0.645, 0.045, 0.355, 1],
            delay: 0.1
          }}
        >
          <SplitHeading className="text-white">
            {heading}
          </SplitHeading>
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
            opacity: 0,
            y: "-50%",
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
