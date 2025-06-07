import { Chapter } from "@/types";
import { motion } from "motion/react";
import { useRef } from "react";
import ChapterContentRenderer from "./ChapterContent";

interface ChapterViewProps {
  chapter: Chapter;
  navExpanded: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  chapterNumber?: number;
  totalChapters?: number;
}

const ChapterView: React.FC<ChapterViewProps> = ({
  chapter,
  navExpanded,
  onPrevious,
  onNext,
  chapterNumber = 1,
  totalChapters = 1
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={scrollRef}
      className={`flex-1 p-20 overflow-y-auto ${navExpanded ? 'pr-[416px]' : 'pr-20'}`}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="max-w-5xl mx-auto space-y-24">
        <div className="space-y-8">
          <motion.div
            className="flex items-center gap-6 text-xs text-white/20 tracking-wider"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="font-mono">CHAPTER {String(chapterNumber).padStart(2, '0')} / {String(totalChapters).padStart(2, '0')}</span>
            <div className="w-16 h-px bg-[linear-gradient(to_right,transparent,#63a1ff,transparent)] bg-[length:4px_1px]"></div>
            <span>Interactive Learning</span>
          </motion.div>

          <motion.h1
            className="text-5xl text-white font-extralight leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {chapter.title}
          </motion.h1>
          <motion.div
            className="flex items-center gap-12 text-sm text-white/30"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <span className="nf nf-md-clock_outline text-[#63a1ff]/60"></span>
              <span>{chapter.estimatedTime || '50 minutes'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="nf nf-cod-terminal text-[#63a1ff]/60"></span>
              <span>Interactive Content</span>
            </div>
          </motion.div>

        </div>

        <ChapterContentRenderer chapter={chapter} />
        <motion.div
          className="grid grid-cols-3 items-center pt-20 border-t border-[#63a1ff]/10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <motion.button
            className="flex items-center gap-3 text-white/30 hover:text-[#63a1ff] disabled:opacity-20"
            onClick={onPrevious}
            disabled={!onPrevious}
            whileHover={onPrevious ? { x: -3 } : {}}
          >
            <span className="nf nf-cod-arrow_left"></span>
            <span className="text-sm">Previous</span>
          </motion.button>

          <div className="text-center">
            <span className="text-xs text-white/20 font-mono tracking-wider">
              {String(chapterNumber).padStart(2, '0')} / {String(totalChapters).padStart(2, '0')}
            </span>
          </div>

          <motion.button
            className="flex items-center justify-end gap-3 text-white/30 hover:text-[#63a1ff] disabled:opacity-20"
            onClick={onNext}
            disabled={!onNext}
            whileHover={onNext ? { x: 3 } : {}}
          >
            <span className="text-sm">Next</span>
            <span className="nf nf-cod-arrow_right"></span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};


export default ChapterView;
