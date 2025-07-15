import { Chapter } from "@/types";
import { motion } from "motion/react";
import { FridayCodeBlock, FridayLatex, FridayMarkdown, FridayMarkdownCode, FridayMermaid, FridayWebDemo } from "./ChapterBlocks";
import { FridayFileTree, TreeViewElement } from "./Tree";

interface ChapterContentRendererProps {
  chapter: Chapter;
}

const ChapterContentRenderer: React.FC<ChapterContentRendererProps> = ({ chapter }) => {
  if (!chapter.content || chapter.content.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <span className="nf nf-cod-loading text-2xl text-[#63a1ff]/40"></span>
          <p className="text-[var(--friday-mute-color)]">Content is being generated...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {chapter.content.map((section, index) => {
        const isMarkdownCode = section.type === 'markdown-code';
        const nextSection = chapter.content[index + 1];
        const nextIsMarkdownCode = nextSection?.type === 'markdown-code';

        const marginClass = isMarkdownCode ? 'mb-4' : nextIsMarkdownCode ? 'mb-8' : 'mb-16';

        return (
          <motion.div
            key={index}
            className={`space-y-4 ${marginClass}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.2 }}
          >
            {section.type === 'text' && (
              <FridayMarkdown content={section.content} />
            )}
            {section.type === 'code' && (
              <FridayCodeBlock language={section.codeBlockLanguage}>
                {section.content}
              </FridayCodeBlock>
            )}
            {section.type === 'diagram' && (
              <FridayMermaid chart={section.content} contentId={section._id} chapterId={chapter._id} />
            )}
            {section.type === 'markdown-code' && (
              <FridayMarkdownCode language={section.codeBlockLanguage} content={section.content} />
            )}
            {section.type === 'file-tree' && (
              <FridayFileTree
                data={(() => {
                  try {
                    return JSON.parse(section.content) as TreeViewElement[];
                  } catch (e) {
                    console.error('Failed to parse file tree data:', e);
                    return [];
                  }
                })()}
              />
            )}
            {section.type === 'web-preview' && (
              <FridayWebDemo content={section.content} />
            )}
            {section.type === 'latex' && (
              <FridayLatex content={section.content} />

            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ChapterContentRenderer;
