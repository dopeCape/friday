import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maxLength = 150 }) => {
  const [isTruncated, setIsTruncated] = useState(true);

  const toggleTruncate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent onClick from firing
    setIsTruncated(!isTruncated);
  };

  const displayText = isTruncated ? `${text.slice(0, maxLength)}...` : text;

  return (
    <div>
      <p className="text-[var(--friday-mute-color)] leading-relaxed">
        {displayText}
      </p>
      {text.length > maxLength && (
        <motion.button
          onClick={toggleTruncate}
          className="text-sm text-[#63a1ff] hover:text-[#63a1ff]/80 transition-colors duration-200 mt-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isTruncated ? 'Show More' : 'Show Less'}
        </motion.button>
      )}
    </div>
  );
};

export default TruncatedText;
