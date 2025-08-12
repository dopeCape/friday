"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Plus, X, Monitor, Laptop, Terminal, Code, Database, Cloud, Layers, Zap, Settings, Sparkles, Target, Rocket, LoaderCircle, LucideIcon } from "lucide-react";
import { z } from "zod";
import { userOnboardingSchema } from "@/lib/schemas/request";
import { UserLevel, UserOs } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs";

interface CodingPersona {
  title: string;
  icon: LucideIcon;
  description: string;
  traits: string[];
  level: UserLevel;
}

interface OSOption {
  name: string;
  icon: LucideIcon;
  value: UserOs;
  reaction: string;
}

interface TechStackOption {
  name: string;
  icon: LucideIcon;
  category: string;
}

interface OnboardingAnswers {
  experience: UserLevel | '';
  persona: CodingPersona | null;
  os: UserOs | '';
  osReaction: string;
  techStack: TechStackOption[];
  terminalKnowledge: boolean | null;
  gitKnowledge: boolean | null;
}

const PersonaSchema = z.object({
  title: z.string(),
  level: z.enum(['beginner', 'intermediate', 'expert']),
  description: z.string(),
  traits: z.array(z.string())
});

const TechStackSchema = z.array(z.object({
  name: z.string(),
  category: z.string()
})).max(10);

const OnboardingDataSchema = z.object({
  stack: z.array(z.string()),
  level: z.enum(['beginner', 'intermediate', 'expert']),
  os: z.enum(['linux', 'mac', 'windows']),
  knowsBasicCommands: z.boolean(),
  knowsGit: z.boolean()
});

const codingPersonas: CodingPersona[] = [
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

const osOptions: OSOption[] = [
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

const techStackOptions: TechStackOption[] = [
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

const terminalCommands: string[] = [
  "ls -la",
  "grep -r 'search' .",
  "docker ps",
  "git status"
];

const gitCommands: string[] = [
  "git commit -m",
  "git push origin",
  "git pull --rebase",
  "git merge feature"
];

const DottedGrid: React.FC = () => (
  <div className="fixed inset-0 opacity-20 pointer-events-none">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dotted-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1" fill="currentColor" className="text-white/30" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotted-grid)" />
    </svg>
  </div>
);

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [showReaction, setShowReaction] = useState<boolean>(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    experience: '',
    persona: null,
    os: '',
    osReaction: '',
    techStack: [],
    terminalKnowledge: null,
    gitKnowledge: null
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customTech, setCustomTech] = useState<string>('');


  const handlePersonaSelect = (persona: CodingPersona): void => {
    try {
      const validatedPersona = PersonaSchema.parse(persona);

      setAnswers(prev => ({
        ...prev,
        experience: validatedPersona.level,
        persona: persona
      }));

      setTimeout(() => setCurrentStep(1), 800);
    } catch (error) {
      console.error('Invalid persona:', error);
      toast.error("Invalid persona selection");
    }
  };

  const handleOsSelect = (os: OSOption): void => {
    try {
      if (!os.value || !['linux', 'mac', 'windows'].includes(os.value)) {
        throw new Error('Invalid OS selection');
      }

      setAnswers(prev => ({
        ...prev,
        os: os.value,
        osReaction: os.reaction
      }));

      setShowReaction(true);
      setTimeout(() => {
        setShowReaction(false);
        setTimeout(() => setCurrentStep(2), 500);
      }, 2500);
    } catch (error) {
      console.error('Invalid OS:', error);
      toast.error("Invalid OS selection");
    }
  };

  const handleTechStackToggle = (tech: TechStackOption): void => {
    try {
      const isSelected = answers.techStack.some(t => t.name === tech.name);
      let newTechStack: TechStackOption[];

      if (isSelected) {
        newTechStack = answers.techStack.filter(t => t.name !== tech.name);
      } else if (answers.techStack.length < 10) {
        newTechStack = [...answers.techStack, tech];
      } else {
        toast.error("Maximum 10 technologies allowed");
        return;
      }

      TechStackSchema.parse(newTechStack);

      setAnswers(prev => ({ ...prev, techStack: newTechStack }));
    } catch (error) {
      console.error('Tech stack validation error:', error);
      toast.error("Invalid technology selection");
    }
  };

  const addCustomTech = (): void => {
    try {
      if (!customTech.trim()) {
        toast.error("Please enter a technology name");
        return;
      }

      if (answers.techStack.length >= 10) {
        toast.error("Maximum 10 technologies allowed");
        return;
      }

      const newTech: TechStackOption = {
        name: customTech.trim(),
        icon: Code,
        category: "custom"
      };

      const newTechStack = [...answers.techStack, newTech];

      // Validate with Zod
      TechStackSchema.parse(newTechStack);

      setAnswers(prev => ({ ...prev, techStack: newTechStack }));
      setCustomTech('');
    } catch (error) {
      console.error('Custom tech validation error:', error);
      toast.error("Invalid technology entry");
    }
  };

  const filteredTechStack = techStackOptions.filter(tech =>
    tech.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTerminalAnswer = (knows: boolean): void => {
    setAnswers(prev => ({ ...prev, terminalKnowledge: knows }));
    setTimeout(() => setCurrentStep(4), 800);
  };

  const handleGitAnswer = async (knows: boolean): Promise<void> => {
    try {
      setAnswers(prev => ({ ...prev, gitKnowledge: knows }));
      setLoading(true);

      const onboardingData = {
        stack: answers.techStack.map(t => t.name),
        level: answers.experience as UserLevel,
        os: answers.os as UserOs,
        knowsBasicCommands: answers.terminalKnowledge!,
        knowsGit: knows
      };

      const validatedData = OnboardingDataSchema.parse(onboardingData);

      const finalData = userOnboardingSchema.parse(validatedData);

      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(finalData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const responseData = await response.json();

      toast.success("Onboarding completed successfully!");

      if (user) {
        await user.reload();
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      window.location.reload();
    } catch (error) {
      console.error('Onboarding error:', error);

      let errorMessage = "An unexpected error occurred during onboarding";

      if (error instanceof z.ZodError) {
        errorMessage = `Validation error: ${error.errors.map(e => e.message).join(', ')}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error("Onboarding failed", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (filteredTechStack.some(tech => tech.name.toLowerCase().includes(value.toLowerCase()))) {
      setSearchTerm(value);
      setCustomTech('');
    } else {
      setCustomTech(value);
      setSearchTerm('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && customTech.trim()) {
      addCustomTech();
    }
  };

  return (
    <div className="min-h-screen  text-white relative overflow-hidden">
      <DottedGrid />

      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex space-x-3">
          {[0, 1, 2, 3, 4].map((step) => (
            <motion.div
              key={step}
              className={`w-2 h-2 rounded-full ${step === currentStep
                ? 'bg-white'
                : step < currentStep
                  ? 'bg-white/60'
                  : 'bg-white/20'
                }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: step * 0.1 }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-6xl mx-auto">
          <AnimatePresence mode="wait" initial={true}>

            {currentStep === 0 && (
              <motion.div
                key="persona-selection"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center"
              >
                <motion.div
                  className="mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <h1 className="text-5xl font-light mb-4 tracking-tight">
                    Pick your coding persona
                  </h1>
                  <p className="text-white/50 text-lg">
                    Which one resonates with you?
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {codingPersonas.map((persona, index) => {
                    const IconComponent = persona.icon;
                    return (
                      <motion.button
                        key={persona.title}
                        onClick={() => handlePersonaSelect(persona)}
                        className="group relative p-8 text-left border border-white/10 rounded-2xl backdrop-blur-sm hover:border-white/20   "
                        initial={{ opacity: 0, y: 60, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: 0.5 + index * 0.2,
                          duration: 0.8,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        whileHover={{
                          y: -8,
                          scale: 1.02,
                          transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative z-10">
                          <IconComponent size={40} className="text-white/80 group-hover:text-white mb-6" />
                          <h3 className="text-2xl font-medium mb-4 text-white">{persona.title}</h3>
                          <p className="text-white/70 text-base mb-6 leading-relaxed">{persona.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {persona.traits.map((trait, i) => (
                              <span key={i} className="text-xs text-white/60 border border-white/10 px-3 py-1.5 rounded-full">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity " />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="os-selection"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center"
              >
                <motion.div
                  className="mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <h1 className="text-5xl font-light mb-4 tracking-tight">
                    What's your digital habitat?
                  </h1>
                </motion.div>

                <AnimatePresence mode="wait">
                  {!showReaction ? (
                    <motion.div
                      key="os-options"
                      className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    >
                      {osOptions.map((os, index) => {
                        const IconComponent = os.icon;
                        return (
                          <motion.button
                            key={os.name}
                            onClick={() => handleOsSelect(os)}
                            className="group relative p-12 border border-white/10 rounded-2xl backdrop-blur-sm hover:border-white/20   "
                            initial={{ opacity: 0, y: 60, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                              delay: 0.4 + index * 0.15,
                              duration: 0.8,
                              ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                            whileHover={{
                              y: -12,
                              scale: 1.05,
                              transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <IconComponent
                              size={48}
                              className="mx-auto mb-6 text-white/80 group-hover:text-white group-hover:scale-110   "
                            />
                            <div className="text-xl font-medium text-white/90 group-hover:text-white transition-colors">
                              {os.name}
                            </div>

                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity " />
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
                      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="text-2xl text-white/80 italic max-w-2xl mx-auto py-16 font-light"
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
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center"
              >
                <motion.div
                  className="mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <h1 className="text-5xl font-light mb-4 tracking-tight">
                    What's in your toolkit?
                  </h1>
                  <p className="text-white/50 text-lg">
                    Select up to 10 technologies
                  </p>
                </motion.div>

                {answers.techStack.length > 0 && (
                  <motion.div
                    className="flex flex-wrap gap-3 justify-center mb-12 min-h-[40px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {answers.techStack.map((tech) => {
                      const IconComponent = tech.icon;
                      return (
                        <motion.span
                          key={tech.name}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full text-sm text-white backdrop-blur-sm"
                        >
                          <IconComponent size={14} />
                          <span>{tech.name}</span>
                          <button
                            onClick={() => handleTechStackToggle(tech)}
                            className="hover:text-red-400 transition-colors"
                            aria-label={`Remove ${tech.name}`}
                          >
                            <X size={12} />
                          </button>
                        </motion.span>
                      );
                    })}
                  </motion.div>
                )}

                <motion.div
                  className="max-w-md mx-auto mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
                    <input
                      type="text"
                      placeholder="Search or add technology..."
                      value={searchTerm || customTech}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="w-full pl-12 pr-12 py-4 bg-transparent border border-white/20 rounded-2xl focus:border-white/40 focus:outline-none placeholder-white/40 text-white text-base backdrop-blur-sm"
                    />
                    {customTech && (
                      <button
                        onClick={addCustomTech}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        aria-label="Add custom technology"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-4xl mx-auto mb-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {(searchTerm ? filteredTechStack : techStackOptions).slice(0, 24).map((tech, index) => {
                    const IconComponent = tech.icon;
                    const isSelected = answers.techStack.some(t => t.name === tech.name);
                    const isDisabled = !isSelected && answers.techStack.length >= 10;

                    return (
                      <motion.button
                        key={tech.name}
                        onClick={() => !isDisabled && handleTechStackToggle(tech)}
                        disabled={isDisabled}
                        className={`p-4 border rounded-xl text-xs backdrop-blur-sm   ${isSelected
                          ? 'border-white/40 bg-white/10 text-white'
                          : isDisabled
                            ? 'border-white/5 opacity-30 cursor-not-allowed'
                            : 'border-white/10 text-white/80 hover:border-white/30 hover:bg-white/5'
                          }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.7 + (index * 0.02),
                          duration: 0.4
                        }}
                        whileHover={!isDisabled ? { scale: 1.05, y: -2 } : {}}
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                        aria-label={`${isSelected ? 'Remove' : 'Add'} ${tech.name}`}
                      >
                        <IconComponent size={20} className="mx-auto mb-2" />
                        <div className="text-[10px] leading-tight font-medium">{tech.name}</div>
                      </motion.button>
                    );
                  })}
                </motion.div>

                {answers.techStack.length > 0 && (
                  <motion.button
                    onClick={() => setCurrentStep(3)}
                    className="px-8 py-3 border border-white/20 rounded-2xl text-white text-base hover:border-white/40 hover:bg-white/5 backdrop-blur-sm   "
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                  </motion.button>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="terminal-knowledge"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center"
              >
                <motion.div
                  className="mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <h1 className="text-5xl font-light mb-4 tracking-tight">
                    How's your terminal game?
                  </h1>
                  <p className="text-white/50 text-lg">
                    Do you know these commands?
                  </p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {terminalCommands.map((cmd, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.6 + index * 0.1,
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      className="p-4 border border-white/10 rounded-xl bg-black/20 backdrop-blur-sm"
                    >
                      <code className="text-green-400 font-mono text-base">
                        $ {cmd}
                      </code>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="flex gap-6 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <motion.button
                    onClick={() => handleTerminalAnswer(true)}
                    className="px-8 py-4 border border-green-500/30 rounded-2xl text-white text-base hover:border-green-500/60 hover:bg-green-500/10 backdrop-blur-sm   "
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Yeah, I know these!
                  </motion.button>
                  <motion.button
                    onClick={() => handleTerminalAnswer(false)}
                    className="px-8 py-4 border border-orange-500/30 rounded-2xl text-white text-base hover:border-orange-500/60 hover:bg-orange-500/10 backdrop-blur-sm   "
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Nope, teach me!
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="git-knowledge"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center"
              >
                <motion.div
                  className="mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <h1 className="text-5xl font-light mb-4 tracking-tight">
                    What about Git?
                  </h1>
                  <p className="text-white/50 text-lg">
                    Are you familiar with these Git commands?
                  </p>
                </motion.div>

                {/* Git Commands */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {gitCommands.map((cmd, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.6 + index * 0.1,
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                      className="p-4 border border-white/10 rounded-xl bg-black/20 backdrop-blur-sm"
                    >
                      <code className="text-blue-400 font-mono text-base">
                        $ {cmd}
                      </code>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  className="flex gap-6 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <motion.button
                    onClick={() => handleGitAnswer(true)}
                    disabled={loading}
                    className="relative px-8 py-4 border border-green-500/30 rounded-2xl text-white text-base hover:border-green-500/60 hover:bg-green-500/10 backdrop-blur-sm disabled:opacity-50   "
                    whileHover={!loading ? { y: -2, scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading && answers.gitKnowledge === true && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-2xl">
                        <LoaderCircle className="animate-spin text-green-500" size={20} />
                      </div>
                    )}
                    Yes, I use Git!
                  </motion.button>
                  <motion.button
                    onClick={() => handleGitAnswer(false)}
                    disabled={loading}
                    className="relative px-8 py-4 border border-orange-500/30 rounded-2xl text-white text-base hover:border-orange-500/60 hover:bg-orange-500/10 backdrop-blur-sm disabled:opacity-50   duration-300"
                    whileHover={!loading ? { y: -2, scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading && answers.gitKnowledge === false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-2xl">
                        <LoaderCircle className="animate-spin text-orange-500" size={20} />
                      </div>
                    )}
                    Git what? Teach me!
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
