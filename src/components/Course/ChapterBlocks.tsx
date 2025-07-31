import { useEffect, useState, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import katex from 'katex';
import mermaid from 'mermaid';
import { motion } from "motion/react";
import FridayVideoPlayer from "./VideoPlayer"
import 'katex/dist/katex.min.css';

interface FridayMermaidProps {
  chart: string;
  contentId: string;
  chapterId: string
}

interface FridayCodeBlockProps {
  children: string;
  className?: string;
  language?: string;
  showLanguage?: boolean;
}

interface FridayWebDemoProps {
  content: string;
}

interface FridayLatexProps {
  content: string;
}

const FridayCodeBlock: React.FC<FridayCodeBlockProps> = ({
  children,
  className,
  language,
  showLanguage = true
}) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const lang = language || (match ? match[1] : 'text');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: 'transparent',
      border: 'none',
      borderRadius: 0,
      margin: 0,
      padding: '1.25rem 1.5rem',
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: '0.875rem',
      lineHeight: '1.6',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: '0.875rem',
      color: 'rgba(255, 255, 255, 0.9)',
    }
  };

  return (
    <motion.div
      className="my-6 group"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative bg-white/[0.015] border border-white/[0.08] rounded-lg overflow-hidden">
        {showLanguage && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
            <span className="text-xs text-white/40 font-mono">{lang}</span>
            <motion.button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 text-xs text-white/30 hover:text-white/60 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? '✓' : 'copy'}
            </motion.button>
          </div>
        )}

        {!showLanguage && (
          <motion.button
            onClick={handleCopy}
            className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 text-xs text-white/30 hover:text-white/60 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? '✓' : 'copy'}
          </motion.button>
        )}

        <SyntaxHighlighter
          style={customStyle}
          language={lang}
          PreTag="div"
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </motion.div>
  );
};

const MermaidModal = ({ onClose, svg }: { onClose: () => void, svg: string }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (svgContainerRef.current) {
      const svgElement = svgContainerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.style.maxWidth = 'none';
        svgElement.style.maxHeight = 'none';
      }
    }
  }, [svg]);


  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && event.target === modalRef.current) {
      onClose();
    }
  };

  return (
    <motion.div
      ref={modalRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
    >
      <motion.div
        className="relative w-[95vw] h-[95vh] flex items-center justify-center"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="w-full h-full p-6 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center"
        >
          <div
            ref={svgContainerRef}
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
        <motion.button
          onClick={onClose}
          className="absolute -top-2 -right-2 text-white/60 hover:text-white bg-black/50 rounded-full p-1 transition-colors"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const FridayMermaid: React.FC<FridayMermaidProps> = ({ chart, contentId, chapterId }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fixAttempts, setFixAttempts] = useState<number>(0);
  const [currentChart, setCurrentChart] = useState<string>(chart);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const saveMermaidDiagram = async (fixedDiagram: string) => {
    try {
      await fetch(`/api/chapters/${chapterId}/mermaid`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          content: fixedDiagram
        }),
      });
      // Fire and forget - no error handling needed
    } catch (err) {
      // Silently fail as requested
      console.log('Failed to save fixed diagram, but continuing...');
    }
  };

  const fixMermaidDiagram = async (diagram: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/fix/mermaid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diagram }),
      });

      if (!response.ok) {
        console.error('Failed to fix diagram:', response.statusText);
        return null;
      }

      const data = await response.json();
      const fixedDiagram = data.data.diagram || null;

      // If we got a fixed diagram, save it in the background
      if (fixedDiagram) {
        saveMermaidDiagram(fixedDiagram);
      }

      return fixedDiagram;
    } catch (err) {
      console.error('Error fixing diagram:', err);
      return null;
    }
  };

  useEffect(() => {
    setFixAttempts(0);
    setCurrentChart(chart);
  }, [chart]);

  useEffect(() => {
    const renderChart = async () => {
      try {
        setIsLoading(true);
        setError('');
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          suppressErrorRendering: true,
          themeVariables: {
            primaryColor: '#63a1ff',
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#63a1ff',
            lineColor: '#63a1ff',
            sectionBkgColor: 'rgba(99, 161, 255, 0.02)',
            altSectionBkgColor: 'rgba(99, 161, 255, 0.01)',
            gridColor: 'rgba(99, 161, 255, 0.15)',
            tertiaryColor: 'rgba(99, 161, 255, 0.05)',
            background: 'transparent',
            mainBkg: 'rgba(99, 161, 255, 0.02)',
            secondBkg: 'rgba(99, 161, 255, 0.01)',
            tertiaryTextColor: 'rgba(255, 255, 255, 0.9)',
            edgeLabelBackground: 'transparent',
            labelColor: 'rgba(255, 255, 255, 0.95)',
            labelTextColor: 'rgba(255, 255, 255, 0.95)',
            labelBackgroundColor: 'transparent',
            edgeTextFill: 'rgba(255, 255, 255, 0.9)',
            nodeTextColor: '#ffffff',
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
          },
          sequence: {
            useMaxWidth: true,
          },
          fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
          fontSize: 13,
        });

        const diagramId = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(diagramId, currentChart.trim());
        setSvg(renderedSvg);
        setError('');
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (fixAttempts < 2) {
          console.log(`Attempting to fix diagram (attempt ${fixAttempts + 1}/2)...`);
          const fixedDiagram = await fixMermaidDiagram(currentChart);
          if (fixedDiagram) {
            setFixAttempts(prev => prev + 1);
            setCurrentChart(fixedDiagram);
            return;
          }
        }
        setError(`Sorry we failed to render diagram${fixAttempts > 0 ? ' after ' + fixAttempts + ' fix attempt' + (fixAttempts > 1 ? 's' : '') : ''}.`);
        setSvg('');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentChart && currentChart.trim()) {
      renderChart();
    } else {
      setError('Empty diagram content');
      setIsLoading(false);
    }
  }, [currentChart, fixAttempts]);

  if (isLoading) {
    return (
      <motion.div
        className="my-8 flex items-center justify-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center space-y-3">
          <motion.div
            className="w-5 h-5 border border-white/20 border-t-[#63a1ff]/60 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/40 text-sm">
            {fixAttempts > 0 ? `Fixing and re-rendering diagram (attempt ${fixAttempts}/2)...` : 'Rendering diagram...'}
          </p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="my-8 text-center py-8 bg-red-500/5 border border-red-500/20 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-red-400/70 text-sm">{error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="my-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div 
        className="bg-white/[0.01] border border-white/[0.06] rounded-lg p-6 cursor-pointer hover:border-white/20 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <div
          className="mermaid-container text-center [&_svg]:max-w-full [&_svg]:h-auto [&_text]:fill-white/85 [&_rect]:stroke-[#63a1ff]/25 [&_path]:stroke-[#63a1ff]/40"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      {isModalOpen && <MermaidModal chart={currentChart} onClose={() => setIsModalOpen(false)} svg={svg} />}
    </motion.div>
  );
};

const FridayWebDemo: React.FC<FridayWebDemoProps> = ({ content }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCode, setShowCode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [content]);

  const handleIframeError = () => {
    setError('Failed to load web demo');
    setIsLoading(false);
  };

  const extractTitle = (html: string) => {
    const match = html.match(/<title>(.*?)<\/title>/i);
    return match ? match[1] : 'Web Demo';
  };

  const title = extractTitle(content);

  if (error) {
    return (
      <motion.div
        className="my-8 text-center py-8 bg-red-500/5 border border-red-500/20 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-red-400/70 text-sm">{error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="my-8 group"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white/[0.015] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
            </div>
            <span className="text-xs text-white/50 font-mono">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setShowCode(!showCode)}
              className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1 rounded"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showCode ? 'hide code' : 'view code'}
            </motion.button>
          </div>
        </div>

        {/* Demo iframe */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/[0.01] flex items-center justify-center">
              <motion.div
                className="w-4 h-4 border border-white/20 border-t-[#63a1ff]/60 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}

          <iframe
            ref={iframeRef}
            srcDoc={content}
            className="w-full min-h-[300px] bg-white"
            style={{
              height: 'auto',
              minHeight: '300px'
            }}
            onLoad={() => setIsLoading(false)}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin"
            title={title}
          />
        </div>

        {/* Code view */}
        {showCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/[0.05]"
          >
            <FridayCodeBlock language="html" showLanguage={false}>
              {content}
            </FridayCodeBlock>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const FridayLatex: React.FC<FridayLatexProps> = ({ content }) => {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const renderLatex = async () => {
      try {
        setIsLoading(true);
        setError('');

        let processedContent = content.trim();

        // If content doesn't have $ markers, assume it's display math
        if (!processedContent.includes('$')) {
          processedContent = `$$${processedContent}$$`;
        }

        if (processedContent.startsWith('$$') && processedContent.endsWith('$$')) {
          const mathContent = processedContent.slice(2, -2).trim();
          const html = katex.renderToString(mathContent, {
            displayMode: true,
            throwOnError: false,
            errorColor: '#ff6b6b',
            colorIsTextColor: true,
            trust: false,
            strict: false
          });
          setRenderedHtml(html);
        } else {
          let html = processedContent;

          // Replace display math $$...$$ - Fixed regex without 's' flag
          html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
            try {
              return katex.renderToString(math.trim(), {
                displayMode: true,
                throwOnError: false,
                errorColor: '#ff6b6b',
                colorIsTextColor: true,
                strict: false
              });
            } catch (e) {
              console.error('Display math error:', e);
              return `<span style="color: #ff6b6b;">Error: ${math}</span>`;
            }
          });

          // Replace inline math $...$
          html = html.replace(/\$([^$\n]+)\$/g, (_, math) => {
            try {
              return katex.renderToString(math.trim(), {
                displayMode: false,
                throwOnError: false,
                errorColor: '#ff6b6b',
                colorIsTextColor: true,
                strict: false
              });
            } catch (e) {
              console.error('Inline math error:', e);
              return `<span style="color: #ff6b6b;">Error: ${math}</span>`;
            }
          });

          setRenderedHtml(html);
        }
        setError('');
      } catch (err) {
        console.error('LaTeX rendering error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to render formula: ${errorMessage}`);
        setRenderedHtml('');
      } finally {
        setIsLoading(false);
      }
    };

    if (content && content.trim()) {
      renderLatex();
    } else {
      setError('Empty LaTeX content');
      setIsLoading(false);
    }
  }, [content]);

  if (isLoading) {
    return (
      <motion.div
        className="my-6 flex items-center justify-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center space-y-3">
          <motion.div
            className="w-4 h-4 border border-white/20 border-t-[#63a1ff]/60 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/40 text-sm">Rendering formula...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="my-6 text-center py-6 bg-red-500/5 border border-red-500/20 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-red-400/70 text-sm">{error}</div>
        <div className="text-white/40 text-xs mt-2 font-mono">{content}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="my-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white/[0.01] border border-white/[0.06] rounded-lg p-6">
        <div
          className="text-center [&_.katex]:text-white/90 [&_.katex-display]:text-white/95 [&_.katex-display]:my-4"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </motion.div>
  );
};

interface FridayMarkdownProps {
  content: string;
  className?: string;
}



const FridayMarkdown: React.FC<FridayMarkdownProps> = ({ content, className = '' }) => {
  const components = {
    h1: ({ children }: any) => (
      <motion.h1
        className="text-3xl text-white font-normal mb-8 tracking-tight leading-tight"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.h1>
    ),
    h2: ({ children }: any) => (
      <motion.h2
        className="text-2xl text-white font-normal mb-6 mt-12 tracking-tight leading-tight relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="relative">
          {children}
          <div className="absolute -bottom-1 left-0 w-8 h-px bg-[#63a1ff]/30"></div>
        </span>
      </motion.h2>
    ),
    h3: ({ children }: any) => (
      <motion.h3
        className="text-xl text-white/90 font-normal mb-4 mt-8 tracking-tight leading-tight"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-lg text-white/85 font-normal mb-3 mt-6 tracking-tight">{children}</h4>
    ),
    p: ({ children }: any) => (
      <motion.p
        className="text-white/65 text-base leading-relaxed mb-6 tracking-wide max-w-none"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.p>
    ),
    ul: ({ children }: any) => (
      <motion.ul
        className="space-y-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.ul>
    ),
    ol: ({ children }: any) => (
      <motion.ol
        className="space-y-3 mb-6 list-decimal list-inside"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.ol>
    ),
    li: ({ children, node }: any) => {
      const isOrdered = node?.parent?.tagName === 'ol';

      if (isOrdered) {
        return (
          <li className="text-white/65 leading-relaxed ml-4">
            {children}
          </li>
        );
      }

      return (
        <motion.li
          className="text-white/65 relative flex items-start gap-4 group"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-[#63a1ff]/50 text-sm mt-1 min-w-[6px] transition-colors group-hover:text-[#63a1ff]/70">
            •
          </span>
          <span className="flex-1 leading-relaxed">{children}</span>
        </motion.li>
      );
    },
    blockquote: ({ children }: any) => (
      <motion.blockquote
        className="border-l-2 border-[#63a1ff]/30 pl-6 my-6 relative"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="italic text-white/75 leading-relaxed">
          {children}
        </div>
      </motion.blockquote>
    ),
    // Table Components - Minimalist & Modern
    table: ({ children }: any) => (
      <motion.div
        className="overflow-x-auto my-12"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <table className="w-full">
          {children}
        </table>
      </motion.div>
    ),
    thead: ({ children }: any) => (
      <thead>
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: any) => {
      const isHeader = props.node?.parent?.tagName === 'thead';

      if (isHeader) {
        return (
          <tr className="border-b border-white/8">
            {children}
          </tr>
        );
      }

      return (
        <motion.tr
          className="border-b border-white/4 hover:bg-white/[0.02] transition-all duration-300 group"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.tr>
      );
    },
    th: ({ children }: any) => (
      <th className="text-left py-4 pr-8  font-medium text-white/70 tracking-wide uppercase text-xs">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="py-5 pr-8 text-base text-white/85 leading-relaxed group-hover:text-white/95 transition-colors duration-300">
        {children}
      </td>
    ),
    code: ({ inline, className, children, ...props }: any) => {
      if (inline || !className || !String(children).includes('\n')) {
        return (
          <code
            className="bg-[#63a1ff]/8 text-[#63a1ff]/90 px-1.5 py-0.5 rounded text-sm font-mono border border-[#63a1ff]/15 transition-colors hover:bg-[#63a1ff]/12"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <FridayCodeBlock
          className={className}
          showLanguage={true}
          {...props}
        >
          {String(children)}
        </FridayCodeBlock>
      );
    },
    pre: ({ children }: any) => children,
    strong: ({ children }: any) => (
      <strong className="text-white font-medium">
        {children}
      </strong>
    ),
    em: ({ children }: any) => (
      <em className="text-white/80 italic">{children}</em>
    ),
    a: ({ href, children }: any) => (
      <motion.a
        href={href}
        className="text-[#63a1ff] hover:text-[#63a1ff]/80 transition-colors duration-200 underline decoration-[#63a1ff]/30 hover:decoration-[#63a1ff]/60 underline-offset-2"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.005 }}
      >
        {children}
      </motion.a>
    ),
    hr: () => (
      <motion.hr
        className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-[#63a1ff]/20 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6 }}
      />
    ),
  };

  return (
    <div className={`friday-markdown prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};



interface FridayMarkdownCodeProps {
  content: string;
  language: string;
  className?: string;
}

const FridayMarkdownCode: React.FC<FridayMarkdownCodeProps> = ({
  content,
  language,
  className = ''
}) => {
  return (
    <div className={className}>
      <FridayCodeBlock
        language={language}
        showLanguage={false}
      >
        {content}
      </FridayCodeBlock>
    </div>
  );
};

interface ContentBlock {
  type: 'text' | 'code' | 'markdown-code' | 'diagram' | 'web-demo' | 'latex' | "video";
  content: string;
  codeBlockLanguage?: string;
  [key: string]: any;
}

interface FridayChapterContentProps {
  contentBlocks: ContentBlock[];
  className?: string;
  chapterId: string;
}

const FridayChapterContent: React.FC<FridayChapterContentProps> = ({
  contentBlocks,
  chapterId,
  className = ''
}) => {
  return (
    <motion.div
      className={`space-y-4 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {contentBlocks.map((block, index) => {
        switch (block.type) {
          case 'text':
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FridayMarkdown content={block.content} />
              </motion.div>
            );

          case 'code':
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FridayCodeBlock
                  language={block.codeBlockLanguage || 'text'}
                  showLanguage={true}
                >
                  {block.content}
                </FridayCodeBlock>
              </motion.div>
            );

          case 'markdown-code':
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FridayMarkdownCode
                  content={block.content}
                  language={block.codeBlockLanguage || 'text'}
                />
              </motion.div>
            );

          case 'diagram':
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FridayMermaid chart={block.content} contentId={block._id} chapterId={chapterId} />
              </motion.div>
            );

          case 'web-demo':
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FridayWebDemo content={block.content} />
              </motion.div>
            );
          case "video":
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FridayVideoPlayer src={block.content} />
              </motion.div>

            )

          case 'latex':
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <FridayLatex content={block.content} />
              </motion.div>
            );

          default:
            return null;
        }
      })}
    </motion.div>
  );
};

export {
  FridayMermaid,
  FridayMarkdown,
  FridayCodeBlock,
  FridayMarkdownCode,
  FridayWebDemo,
  FridayLatex,
  FridayChapterContent
};
