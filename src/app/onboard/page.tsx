"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import VertialDottedLines from "@/components/Homepage/VerticalDottedLines";
import { Search, Plus, X, Monitor, Laptop, Terminal, Code, Database, Cloud, Layers, Zap, Settings, Sparkles, Target, Rocket, LoaderCircle } from "lucide-react";
import z from "zod";
import { userOnboardingSchema } from "@/lib/schemas/request";
import { UserLevel, UserOs } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner"
import { useAuth, useUser } from "@clerk/nextjs";
const codingPersonas = [
  {
    title: "The Explorer",
    icon: Rocket,
    description: "I learn by breaking things and figuring out why",
    traits: ["Curious about new technologies", "Enjoys experimenting", "Learns through trial and error"],
    level: "beginner"
  },
  {
    title: "The Builder",
    icon: Target,
    description: "I focus on creating functional solutions that work",
    traits: ["Values working solutions", "Pragmatic approach", "Balances speed with quality"],
    level: "intermediate"
  },
  {
    title: "The Architect",
    icon: Sparkles,
    description: "I design systems thinking about scale, performance, and maintainability",
    traits: ["Thinks about architecture", "Considers long-term implications", "Optimizes for team collaboration"],
    level: "expert"
  }
];

const osOptions = [
  {
    name: "Linux",
    icon: Terminal,
    value: "linux",
    reaction: "A person of culture, I see. Welcome to the superior choice."
  },
  {
    name: "macOS",
    value: "mac",
    icon: Laptop,
    reaction: "Sleek choice! At least you're not using Windows..."
  },
  {
    name: "Windows",
    value: "windows",
    icon: Monitor,
    reaction: "Disappointed but not surprised. We'll make it work."
  }
];


const techStackOptions = [
  { name: "JavaScript", icon: Code, category: "language" },
  { name: "TypeScript", icon: Code, category: "language" },
  { name: "Python", icon: Code, category: "language" },
  { name: "Java", icon: Code, category: "language" },
  { name: "C++", icon: Zap, category: "language" },
  { name: "Rust", icon: Settings, category: "language" },
  { name: "Go", icon: Zap, category: "language" },
  { name: "React", icon: Layers, category: "framework" },
  { name: "Vue.js", icon: Layers, category: "framework" },
  { name: "Angular", icon: Layers, category: "framework" },
  { name: "Node.js", icon: Settings, category: "runtime" },
  { name: "Next.js", icon: Layers, category: "framework" },
  { name: "Express", icon: Settings, category: "framework" },
  { name: "Django", icon: Layers, category: "framework" },
  { name: "Flask", icon: Code, category: "framework" },
  { name: "Spring", icon: Layers, category: "framework" },
  { name: "Docker", icon: Database, category: "tool" },
  { name: "Kubernetes", icon: Cloud, category: "tool" },
  { name: "AWS", icon: Cloud, category: "cloud" },
  { name: "MongoDB", icon: Database, category: "database" },
  { name: "PostgreSQL", icon: Database, category: "database" },
  { name: "Redis", icon: Database, category: "database" },
  { name: "GraphQL", icon: Settings, category: "api" },
  { name: "REST API", icon: Settings, category: "api" }
];

const terminalCommands = [
  "ls -la",
  "grep -r 'search' .",
  "docker ps",
  "git status"
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [showReaction, setShowReaction] = useState(false);
  const [answers, setAnswers] = useState({
    experience: '',
    persona: null,
    os: '',
    osReaction: '',
    techStack: [],
    terminalKnowledge: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [customTech, setCustomTech] = useState('');


  const handlePersonaSelect = (persona: { title: string; description: string; traits: string[]; level: string; }) => {
    setAnswers({ ...answers, experience: persona.level, persona: persona });
    setTimeout(() => setCurrentStep(1), 1000);
  };

  const handleOsSelect = (os: { value: string; reaction: string; }) => {
    setAnswers({ ...answers, os: os.value, osReaction: os.reaction });
    setShowReaction(true);
    setTimeout(() => {
      setShowReaction(false);
      setTimeout(() => setCurrentStep(2), 500);
    }, 2500);
  };

  const handleTechStackToggle = (tech: { name: string; category: string; }) => {
    const isSelected = answers.techStack.some(t => t.name === tech.name);
    if (isSelected) {
      setAnswers({
        ...answers,
        techStack: answers.techStack.filter(t => t.name !== tech.name)
      });
    } else if (answers.techStack.length < 10) {
      setAnswers({
        ...answers,
        techStack: [...answers.techStack, tech]
      });
    }
  };

  const addCustomTech = () => {
    if (customTech.trim() && answers.techStack.length < 10) {
      const newTech = { name: customTech.trim(), icon: Code, category: "custom" };
      setAnswers({
        ...answers,
        techStack: [...answers.techStack, newTech]
      });
      setCustomTech('');
    }
  };

  const filteredTechStack = techStackOptions.filter(tech =>
    tech.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleTerminalAnswer = async (knows: boolean) => {
    setAnswers({ ...answers, terminalKnowledge: knows });
    setLoading(true);

    try {
      const body: z.infer<typeof userOnboardingSchema> = {
        stack: answers.techStack.map(t => t.name),
        level: answers.experience as UserLevel,
        os: answers.os as UserOs,
        knowsBasicCommands: knows
      }

      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
      toast.success("Onboarding completed successfully!");
      await user.reload();
      router.push("/");
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "An unexpected error occurred during onboarding";

      toast.error("Onboarding failed", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-[var(--friday-background)] text-white my-[120px] mx-auto ">
      <div className="relative w-[800px] h-[600px] mx-auto">
        <motion.div
          className="absolute inset-0 border border-dashed border-white/20 rounded-xl"
          initial={{
            opacity: 0,
            scale: 0.9,
            borderColor: "rgba(255,255,255,0)"
          }}
          animate={{
            opacity: 1,
            scale: 1,
            borderColor: "rgba(255,255,255,0.2)"
          }}
          transition={{
            duration: 1,
            ease: [0.645, 0.045, 0.355, 1],
            delay: 0.2
          }}
        />

        {[
          { pos: "top-0 left-0", border: "border-l-2 border-t-2", radius: "rounded-tl-xl", delay: 0.6 },
          { pos: "top-0 right-0", border: "border-r-2 border-t-2", radius: "rounded-tr-xl", delay: 0.7 },
          { pos: "bottom-0 left-0", border: "border-l-2 border-b-2", radius: "rounded-bl-xl", delay: 0.8 },
          { pos: "bottom-0 right-0", border: "border-r-2 border-b-2", radius: "rounded-br-xl", delay: 0.9 }
        ].map((corner, i) => (
          <motion.div
            key={i}
            className={`absolute ${corner.pos} w-4 h-4 ${corner.border} border-white/40 ${corner.radius}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: corner.delay }}
          />
        ))}

        <div className="absolute left-12 top-8 bottom-8 w-[1px]">
          <VertialDottedLines animationDirection="top" maskDirection="none" delay={0.4} />
        </div>
        <div className="absolute right-12 top-8 bottom-8 w-[1px]">
          <VertialDottedLines animationDirection="top" maskDirection="none" delay={0.5} />
        </div>

        <div className="absolute inset-0 p-12 flex flex-col justify-center">
          <AnimatePresence mode="wait" initial={true}>
            {currentStep === 0 && (
              <motion.div
                key="persona-selection"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
                className="text-center space-y-8"
              >
                <div className="space-y-3">
                  <h2 className="text-2xl font-light text-white">
                    Pick your coding persona
                  </h2>
                  <p className="text-white/60 text-sm">
                    Which one resonates with you?
                  </p>
                </div>

                <div className="space-y-4">
                  {codingPersonas.map((persona, index) => {
                    const IconComponent = persona.icon;
                    return (
                      <motion.button
                        key={persona.title}
                        onClick={() => handlePersonaSelect(persona)}
                        className="group w-[80%] p-4 text-left border border-white/10 rounded-xl   cursor-pointer  "
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.1 + index * 0.15,
                          duration: 0.6,
                          ease: [0.645, 0.045, 0.355, 1]
                        }}
                        whileHover={{
                          x: 8,
                          borderColor: "rgba(255,255,255,0.3)",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start space-x-4">
                          <IconComponent size={24} className="text-white/80 group-hover:text-white transition-colors flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-2">{persona.title}</h3>
                            <p className="text-white/70 text-sm mb-3">{persona.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {persona.traits.map((trait, i) => (
                                <span key={i} className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded">
                                  {trait}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="os-selection"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
                className="text-center space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-light text-white">
                    What's your digital habitat?
                  </h2>
                </div>
                <AnimatePresence mode="wait">
                  {!showReaction ? (
                    <motion.div
                      key="os-options"
                      className="grid grid-cols-3 gap-6 max-w-md mx-auto"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      {osOptions.map((os, index) => {
                        const IconComponent = os.icon;
                        return (
                          <motion.button
                            key={os.name}
                            onClick={() => handleOsSelect(os)}
                            className="group p-6 border border-white/10 rounded-xl  cursor-pointer  "
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                              delay: index * 0.1 + 0.2,
                              duration: 0.5,
                              ease: [0.645, 0.045, 0.355, 1]
                            }}
                            whileHover={{
                              y: -6,
                              borderColor: "rgba(255,255,255,0.3)",
                              backgroundColor: "rgba(255,255,255,0.05)",
                              transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <IconComponent
                              size={32}
                              className="mx-auto mb-3 text-white/80 group-hover:text-white group-hover:scale-110 "
                            />
                            <div className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                              {os.name}
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="os-reaction"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, ease: [0.645, 0.045, 0.355, 1] }}
                      className="text-lg text-white/80 italic max-w-md mx-auto py-12"
                    >
                      {answers.osReaction}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div
                key="tech-stack"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-light text-white">
                    What's in your toolkit?
                  </h2>
                  <p className="text-white/60 text-sm">
                    Select up to 10 technologies
                  </p>
                </div>

                {answers.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center min-h-[32px]">
                    {answers.techStack.map((tech) => {
                      const IconComponent = tech.icon;
                      return (
                        <motion.span
                          key={tech.name}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white"
                        >
                          <IconComponent size={12} />
                          <span>{tech.name}</span>
                          <button
                            onClick={() => handleTechStackToggle(tech)}
                            className="hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <X size={10} />
                          </button>
                        </motion.span>
                      );
                    })}
                  </div>
                )}
                <div className="max-w-sm mx-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
                    <input
                      type="text"
                      placeholder="Search or add technology..."
                      value={searchTerm || customTech}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (filteredTechStack.some(tech => tech.name.toLowerCase().includes(value.toLowerCase()))) {
                          setSearchTerm(value);
                          setCustomTech('');
                        } else {
                          setCustomTech(value);
                          setSearchTerm('');
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customTech.trim()) {
                          addCustomTech();
                        }
                      }}
                      className="w-full pl-10 pr-10 py-2.5 bg-transparent border border-white/20 rounded-lg focus:border-white/40 focus:outline-none  placeholder-white/40 text-white text-sm"
                    />
                    {customTech && (
                      <button
                        onClick={addCustomTech}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors cursor-pointer"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-w-lg mx-auto">
                  <div className="grid grid-cols-6 gap-2 max-h-48 ">
                    {(searchTerm ? filteredTechStack : techStackOptions).slice(0, 18).map((tech) => {
                      const IconComponent = tech.icon;
                      const isSelected = answers.techStack.some(t => t.name === tech.name);
                      const isDisabled = !isSelected && answers.techStack.length >= 10;

                      return (
                        <motion.button
                          key={tech.name}
                          onClick={() => !isDisabled && handleTechStackToggle(tech)}
                          disabled={isDisabled}
                          className={`p-2 cursor-pointer border rounded-lg text-xs ${isSelected
                            ? 'border-white/40 bg-white/10 text-white'
                            : isDisabled
                              ? 'border-white/5 opacity-30 cursor-not-allowed'
                              : 'border-white/10 text-white/80 hover:border-white/30 hover:bg-white/5'
                            }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          whileHover={!isDisabled ? { scale: 1.05 } : {}}
                        >
                          <IconComponent size={16} className="mx-auto mb-1" />
                          <div className="text-[10px] leading-tight">{tech.name}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {answers.techStack.length > 0 && (
                  <div className="text-center">
                    <motion.button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2.5 border border-white/20 rounded-lg  text-white text-sm hover:border-white/40 hover:bg-white/5 cursor-pointer"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      whileHover={{ y: -2 }}
                    >
                      Continue
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
            {currentStep === 3 && (
              <motion.div
                key="terminal-knowledge"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.645, 0.045, 0.355, 1] }}
                className="text-center space-y-8"
              >
                <div className="space-y-3">
                  <h2 className="text-2xl font-light text-white">
                    How's your terminal game?
                  </h2>
                  <p className="text-white/60 text-sm">
                    Do you know these commands?
                  </p>
                </div>

                <div className="space-y-3 max-w-sm mx-auto">
                  {terminalCommands.map((cmd, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.1 + 0.2,
                        duration: 0.4,
                        ease: [0.645, 0.045, 0.355, 1]
                      }}
                      className="p-3 border border-white/10 rounded-lg bg-gray-900/30"
                    >
                      <code className="text-green-400 font-mono text-sm">
                        $ {cmd}
                      </code>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={() => handleTerminalAnswer(true)}
                    className="px-6 py-2.5 border border-green-500/30 rounded-lg  text-white text-sm hover:border-green-500/60 hover:bg-green-500/10 cursor-pointer relative"
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5, ease: [0.645, 0.045, 0.355, 1] }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                  >
                    {loading && answers.terminalKnowledge && <div className="absolute grid place-items-center top-0 left-0 w-full h-full bg-black rounded-lg"><LoaderCircle className="animate-spin text-green-500" /></div>} Yeah, I know these!
                  </motion.button>
                  <motion.button
                    disabled={loading}
                    onClick={() => handleTerminalAnswer(false)}
                    className="px-6 py-2.5 border border-orange-500/30 rounded-lg  text-white text-sm hover:border-orange-500/60 hover:bg-orange-500/10 cursor-pointer relative"
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5, ease: [0.645, 0.045, 0.355, 1] }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading && !answers.terminalKnowledge && <div className="absolute grid place-items-center top-0 left-0 w-full h-full bg-black rounded-lg"><LoaderCircle className="animate-spin text-orange-500" /></div>} Nope, Teach me!
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
