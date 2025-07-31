"use client";
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <>
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 15% 25%, rgba(99,161,255,0.06) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(99,161,255,0.04) 0%, transparent 60%)',
            'radial-gradient(circle at 85% 25%, rgba(99,161,255,0.04) 0%, transparent 60%), radial-gradient(circle at 15% 75%, rgba(99,161,255,0.06) 0%, transparent 60%)',
            'radial-gradient(circle at 15% 25%, rgba(99,161,255,0.06) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(99,161,255,0.04) 0%, transparent 60%)'
          ]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-blue-400/15 rounded-full"
          style={{
            left: `${5 + i * 12}%`,
            top: `${10 + i * 10}%`,
          }}
          animate={{
            y: [0, -400, -800],
            x: [0, Math.sin(i * 0.3) * 40, 0],
            opacity: [0, 0.3, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 20 + i * 4,
            repeat: Infinity,
            delay: i * 4,
            ease: "easeOut"
          }}
        />
      ))}
    </>
  );
};

export default AnimatedBackground;
