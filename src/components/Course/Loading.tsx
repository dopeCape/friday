import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete?: () => void;
  isLooping?: boolean;
}


const EnhancedLoadingScreen: React.FC<LoadingScreenProps> = ({
  onComplete,
  isLooping = true
}) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const phases = [
    "parsing",
    "analyzing",
    "generating",
    "optimizing",
    "compiling"
  ];

  useEffect(() => {
    let phaseIndex = 0;
    let currentProgress = 0;

    const processPhase = () => {
      if (phaseIndex >= phases.length) {
        if (isLooping) {
          setTimeout(() => {
            setProgress(0);
            setCurrentPhase(0);
            setCycleCount(prev => prev + 1);
            phaseIndex = 0;
            currentProgress = 0;
            processPhase();
          }, 500); return;
        } else {
          setTimeout(() => onComplete?.(), 200);
          return;
        }
      }

      setCurrentPhase(phaseIndex);
      const phaseProgress = 100 / phases.length;

      const timer = setInterval(() => {
        currentProgress += (phaseProgress / 500) * 50;
        setProgress(Math.min(currentProgress, (phaseIndex + 1) * phaseProgress));

        if (currentProgress >= (phaseIndex + 1) * phaseProgress) {
          clearInterval(timer);
          phaseIndex++;
          setTimeout(processPhase, 150);
        }
      }, 50);
    };

    processPhase();
  }, [onComplete, isLooping]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center  backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center space-y-16">
        <div className="relative flex flex-col items-center">
          <motion.div
            className="w-px h-16 bg-[linear-gradient(to_bottom,transparent,#63a1ff,transparent)] bg-[length:1px_4px] mx-auto"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 64, opacity: 0.6 }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px bg-[#63a1ff]"
            style={{ height: `${progress}%` }}
          />

          <div className="absolute -right-12 top-0 h-full flex flex-col justify-between py-2">
            {phases.map((_, index) => (
              <motion.div
                key={index}
                className={`w-1 h-1 rounded-full ${index <= currentPhase ? 'bg-[#63a1ff]/80' : 'bg-white/10'
                  }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.5 }}
              />
            ))}
          </div>

          <motion.div
            className="absolute -left-16 top-1/2 transform -translate-y-1/2 text-[#63a1ff]/60 text-xs font-mono"
            key={Math.round(progress)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {String(Math.round(progress)).padStart(2, '0')}
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            className="text-[var(--friday-mute-color)] text-sm font-mono tracking-wider"
            key={`${currentPhase}-${cycleCount}`} // Include cycle count for proper re-animation
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {phases[currentPhase]}
          </motion.div>

          <motion.div
            className="flex justify-center gap-2"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-px bg-[#63a1ff]/30"
                animate={{
                  scaleX: [1, 3, 1],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </motion.div>
        </div>

        <motion.div
          className="text-xs text-white/15 font-mono tracking-wider"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          AI_ENGINE_0.1.0
          {isLooping && cycleCount > 0 && (
            <motion.span
              className="ml-2 text-[#63a1ff]/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              CYCLE_{cycleCount + 1}
            </motion.span>
          )}
        </motion.div>

        {isLooping && (
          <motion.div
            className="text-xs text-white/20 font-mono tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            DEEP_ANALYSIS_MODE
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedLoadingScreen;
