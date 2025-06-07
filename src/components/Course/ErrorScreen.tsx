import { motion } from "motion/react";

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

interface NotFoundScreenProps {
  onGoHome: () => void;
}
const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRetry }) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center space-y-12 max-w-md">
        <motion.div
          className="relative mx-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-16 h-16 border border-red-500/30 rounded-full flex items-center justify-center relative"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <span className="nf nf-cod-error text-2xl text-red-500/80"></span>
          </motion.div>

          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-500/40 rounded-full"
              style={{
                left: `${50 + 25 * Math.cos((i * 120 * Math.PI) / 180)}%`,
                top: `${50 + 25 * Math.sin((i * 120 * Math.PI) / 180)}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="space-y-3">
            <h1 className="text-2xl text-white font-light">
              Connection Failed
            </h1>
            <p className="text-[var(--friday-mute-color)] leading-relaxed">
              Unable to load course data. The server might be temporarily unavailable or there's a network issue.
            </p>
          </div>

          <motion.div
            className="text-xs text-red-500/60 font-mono tracking-wider bg-red-500/5 border border-red-500/20 rounded-sm px-4 py-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            ERROR: {error}
          </motion.div>
        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            className="px-6 py-3 bg-[#63a1ff]/10 border border-[#63a1ff]/30 text-[#63a1ff] rounded-sm hover:bg-[#63a1ff]/20 transition-colors"
            onClick={onRetry}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Try Again
          </motion.button>

          <motion.button
            className="px-6 py-3 text-white/50 hover:text-white transition-colors"
            onClick={() => window.location.href = '/'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Go Home
          </motion.button>
        </motion.div>

        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px bg-red-500/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [1, 2, 1],
                y: [-20, -40, -20]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                delay: Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const NotFoundScreen: React.FC<NotFoundScreenProps> = ({ onGoHome }) => {
  return (
    <motion.div
      className="fixed inset-0  flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center space-y-12 max-w-lg">
        <motion.div
          className="relative mx-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4">
            <motion.div
              className="text-6xl font-mono text-white/10"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              404
            </motion.div>

            <motion.div
              className="flex justify-center items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="nf nf-fa-search text-xl text-[#63a1ff]/60"></span>
              <div className="w-8 h-px bg-[#63a1ff]/30"></div>
              <span className="nf nf-cod-question text-xl text-white/30"></span>
            </motion.div>
          </div>

          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10 text-sm"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                opacity: [0, 0.3, 0],
                y: [-10, -30, -10],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 6 + Math.random() * 3,
                delay: Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ?
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="space-y-3">
            <h1 className="text-3xl text-white font-light">
              Course Not Found
            </h1>
            <p className="text-[var(--friday-mute-color)] leading-relaxed">
              The course you're looking for doesn't exist or has been moved. It might have been deleted or the URL is incorrect.
            </p>
          </div>

        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            className="px-6 py-3 bg-[#63a1ff]/10 border border-[#63a1ff]/30 text-[#63a1ff] rounded-sm hover:bg-[#63a1ff]/20 transition-colors"
            onClick={onGoHome}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Browse Courses
          </motion.button>

          <motion.button
            className="px-6 py-3 text-white/50 hover:text-white transition-colors"
            onClick={() => window.history.back()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export { ErrorScreen as ChapterErrorScreen, NotFoundScreen as ChapterNotFoundScreen };
