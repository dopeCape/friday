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

const MagneticGrid = ({ mouseX, mouseY }) => {
  const gridRef = useRef(null);

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

const FloatingCode = ({ code, delay = 0 }) => (
  <motion.div
    className="absolute text-white/10 font-mono text-sm pointer-events-none select-none"
    initial={{
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
      y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800,
      opacity: 0,
      rotate: Math.random() * 20 - 10
    }}
    animate={{
      y: -200,
      opacity: [0, 0.4, 0.4, 0],
      rotate: Math.random() * 40 - 20,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200)
    }}
    transition={{
      duration: Math.random() * 25 + 35,
      delay: delay + Math.random() * 15,
      repeat: Infinity,
      ease: "linear"
    }}
  >
    {code}
  </motion.div>
);

const MorphingBlob = () => (
  <motion.div
    className="fixed top-1/4 right-1/4 w-96 h-96 pointer-events-none"
    animate={{
      x: [0, 100, -50, 0],
      y: [0, -80, 120, 0],
    }}
    transition={{
      duration: 20,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <motion.div
      className="w-full h-full bg-blue-500/5 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.3, 0.8, 1],
        borderRadius: ["50%", "30%", "60%", "50%"],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </motion.div>
);

const CodeMatrix = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-white/5 font-mono text-xs"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          opacity: [0, 0.3, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4 + Math.random() * 3,
          delay: Math.random() * 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {['class diagram', 'sequence flow', 'microservices', 'load balancer', 'database', 'API design', 'distributed', 'scalability'][Math.floor(Math.random() * 8)]}
      </motion.div>
    ))}
  </div>
);

const TextAnimation = () => {
  const heading = "Master Systems Through AI";
  const subHeading = "Personalized courses that adapt to your learning style. From fundamentals to expert-level system design.";

  return (
    <div className="relative px-4">
      <div className="relative flex flex-wrap justify-center z-10 text-xl sm:text-2xl xl:text-4xl font-semibold p-6">
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
          <div className="text-white">
            {heading}
          </div>
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

      <div className="relative text-base sm:text-lg xl:text-xl text-center text-gray-400 p-6 mt-4">
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
};

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
    router.push("/create-course");
  };

  const handleBeginClick = () => {
    router.push("/create-course");
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <MagneticGrid mouseX={mousePosition.x} mouseY={mousePosition.y} />
      <MorphingBlob />
      <CodeMatrix />

      {/* Floating code snippets - Updated for system design */}
      {[
        'class UserService { }',
        'import { microservice } from "arch"',
        'export default SystemDesign',
        'async scalable() { return distributed }',
        'const architecture = await design()',
        '// TODO: optimize for scale'
      ].map((code, i) => (
        <FloatingCode key={code} code={code} delay={i * 4} />
      ))}

      {/* Removed cursor dot component */}

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
            <TryFriday text="Start Learning" clickHandler={handleChangeSetShow} isTextBox={showPromptInput} disabled={!isLoaded} />
          </div>

          <div className="h-16 mx-auto w-[30%] relative">
            <VertialDottedLines animationDirection="top" maskDirection="bottom" delay={0.5} />
          </div>
        </div>
      </AnimatePresence>

      {/* Problem/Solution */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-32"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2 className="text-5xl md:text-7xl font-extralight text-white/90 mb-4 tracking-tighter">
              Beyond
            </h2>
            <h3 className="text-2xl md:text-4xl font-light text-white/40 tracking-wider">
              generic courses
            </h3>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-40 items-start">
            <motion.div
              className="space-y-12"
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="space-y-8">
                <motion.p
                  className="text-lg text-white/60 font-light leading-relaxed"
                  whileHover={{ x: 10, transition: { duration: 0.3 } }}
                >
                  One-size-fits-all courses that bore you
                </motion.p>
                <motion.p
                  className="text-lg text-white/60 font-light leading-relaxed"
                  whileHover={{ x: 10, transition: { duration: 0.3 } }}
                >
                  Outdated content that doesn't evolve
                </motion.p>
                <motion.p
                  className="text-lg text-white/60 font-light leading-relaxed"
                  whileHover={{ x: 10, transition: { duration: 0.3 } }}
                >
                  Complex topics explained poorly
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              className="space-y-12"
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <div className="space-y-8">
                <motion.p
                  className="text-lg text-blue-400/80 font-light leading-relaxed"
                  whileHover={{ x: -10, transition: { duration: 0.3 } }}
                >
                  → AI-generated content for your level
                </motion.p>
                <motion.p
                  className="text-lg text-blue-400/80 font-light leading-relaxed"
                  whileHover={{ x: -10, transition: { duration: 0.3 } }}
                >
                  → Multi-modal learning that adapts
                </motion.p>
                <motion.p
                  className="text-lg text-blue-400/80 font-light leading-relaxed"
                  whileHover={{ x: -10, transition: { duration: 0.3 } }}
                >
                  → Master system design fundamentals
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Learning Philosophy */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            className="text-5xl md:text-7xl font-extralight mb-16 tracking-tighter text-white/90"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
          >
            Learn by understanding
          </motion.h2>

          <motion.p
            className="text-xl font-extralight text-white/50 max-w-3xl mx-auto leading-relaxed mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            AI creates the perfect learning path for complex technical topics. Text, code, diagrams, videos - whatever helps you master the concept.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-16 mt-32">
            {[
              { title: "Adaptive content", desc: "Generated for your skill level" },
              { title: "Multi-modal", desc: "Text, code, diagrams, videos" },
              { title: "Always current", desc: "Content evolves with technology" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="text-center group"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.3 }}
              >
                <motion.div
                  className="w-2 h-2 bg-blue-400/40 rounded-full mx-auto mb-8"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                />
                <h3 className="text-2xl font-light text-white/80 mb-2">
                  {feature.title}
                </h3>
                <p className="text-lg text-white/40 font-extralight">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What you'll master */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl md:text-6xl font-extralight text-center mb-32 tracking-tighter text-white/90"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            What you'll master
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-20">
            {[
              { title: "System Design", desc: "High-level architecture patterns" },
              { title: "OOP & UML", desc: "Design principles & modeling" },
              { title: "Distributed Systems", desc: "Scalability & fault tolerance" },
              { title: "Database Design", desc: "SQL, NoSQL & trade-offs" }
            ].map((outcome, i) => (
              <motion.div
                key={i}
                className="text-center group cursor-pointer"
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                whileHover={{ y: -20 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-8 border border-white/10 rounded-lg flex items-center justify-center group-hover:border-white/30 transition-colors duration-500"
                  animate={{
                    borderColor: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 1
                  }}
                >
                  <motion.div
                    className="w-2 h-2 bg-white/30 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5
                    }}
                  />
                </motion.div>

                <h3 className="text-2xl font-light text-white/80 mb-4 tracking-wide">
                  {outcome.title}
                </h3>

                <p className="text-sm text-white/40 tracking-wide">
                  {outcome.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call */}
      <section className="py-60 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
          >
            <h2 className="text-6xl md:text-8xl font-extralight mb-8 tracking-tighter text-white/90 leading-none">
              Master
            </h2>
            <h3 className="text-2xl md:text-4xl font-light text-white/40 mb-20 tracking-wider">
              complex systems
            </h3>

            <motion.p
              className="text-lg font-extralight text-white/60 mb-32 leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              From computer science fundamentals to expert-level system design.
              <br />AI-powered learning that adapts to you.
            </motion.p>

            <motion.button
              className="px-20 py-8 border border-white/20 text-white font-extralight tracking-[0.3em] text-sm hover:border-white/40 transition-all duration-700 group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 1 }}
              whileHover={{
                y: -8,
                scale: 1.02,
                borderColor: "rgba(255,255,255,0.6)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBeginClick}
            >
              BEGIN LEARNING
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
