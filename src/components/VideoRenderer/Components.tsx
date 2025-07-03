import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import katex from 'katex';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';
import { FridayMarkdown } from "../Course/ChapterBlocks";

export const fridayConfig = {
  colors: {
    background: '#07080A',
    hover: '#0C0D0F',
    muted: '#666768',
    primary: '#63a1ff',
    white: '#ffffff',
    border: '#1a1b1e'
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    xxl: '4rem'
  },
  typography: {
    hero: '4.5rem',
    h1: '3rem',
    h2: '2.5rem',
    h3: '1.75rem',
    body: '1.4rem',
    small: '1.2rem',
    code: '1.1rem'
  }
};

// Friday Video Components
const FridayCodeBlock = ({ content, language = 'text', comment }) => {
  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: 'transparent',
      border: 'none',
      borderRadius: 0,
      margin: 0,
      padding: '1.5rem',
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: fridayConfig.typography.code,
      lineHeight: '1.4',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word' as any,
      overflowWrap: 'break-word' as any
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: fridayConfig.typography.code,
      color: 'rgba(255, 255, 255, 0.95)',
      whiteSpace: 'pre-wrap' as any,
      wordBreak: 'break-word' as any,
    }
  };

  return (
    <div className="w-full">
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: fridayConfig.colors.hover,
          border: `2px solid ${fridayConfig.colors.border}`,
          maxWidth: '100%'
        }}
      >
        {comment && (
          <div className="px-4 py-2 border-b border-white/[0.08]">
            <span
              className="text-sm font-mono"
              style={{ color: fridayConfig.colors.muted }}
            >
              # {comment}
            </span>
          </div>
        )}
        <div>
          <SyntaxHighlighter
            style={customStyle}
            language={language}
            PreTag="div"
            wrapLines={true}
            wrapLongLines={true}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

const FridayMermaid = ({ chart }) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const renderChart = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          suppressErrorRendering: true,
          themeVariables: {
            primaryColor: fridayConfig.colors.primary,
            primaryTextColor: fridayConfig.colors.white,
            primaryBorderColor: fridayConfig.colors.primary,
            lineColor: fridayConfig.colors.primary,
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
            nodeTextColor: fridayConfig.colors.white,
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
          fontSize: 14,
        });
        const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(diagramId, chart.trim());
        setSvg(renderedSvg);
        setError('');
      } catch (err) {
        setError('Failed to render diagram');
        setSvg('');
      }
    };

    if (chart && chart.trim()) {
      renderChart();
    } else {
      setError('Empty diagram content');
    }
  }, [chart]);

  if (error) {
    return (
      <div
        className="text-center py-6 rounded-lg"
        style={{
          backgroundColor: fridayConfig.colors.hover,
          border: `1px solid ${fridayConfig.colors.border}`,
          color: fridayConfig.colors.muted
        }}
      >
        {error}
      </div>
    );
  }

  if (!svg) return null;

  return (
    <div
      className="w-full p-4 rounded-lg"
      style={{
        backgroundColor: fridayConfig.colors.hover,
        border: `1px solid ${fridayConfig.colors.border}`,
        maxWidth: '100%'
      }}
    >
      <div
        className="text-center [&_svg]:max-w-full [&_svg]:h-auto [&_text]:fill-white/85 [&_rect]:stroke-[#63a1ff]/25 [&_path]:stroke-[#63a1ff]/40"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};

const FridayLatex = ({ content }) => {
  const [renderedHtml, setRenderedHtml] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const renderLatex = async () => {
      try {
        let processedContent = content.trim();

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
              return `<span style="color: #ff6b6b;">Error: ${math}</span>`;
            }
          });

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
              return `<span style="color: #ff6b6b;">Error: ${math}</span>`;
            }
          });

          setRenderedHtml(html);
        }
        setError('');
      } catch (err) {
        setError(`Failed to render formula: ${err.message}`);
        setRenderedHtml('');
      }
    };

    if (content && content.trim()) {
      renderLatex();
    } else {
      setError('Empty LaTeX content');
    }
  }, [content]);

  if (error) {
    return (
      <div
        className="text-center py-4 rounded-lg"
        style={{
          backgroundColor: fridayConfig.colors.hover,
          border: `1px solid ${fridayConfig.colors.border}`,
          color: fridayConfig.colors.muted
        }}
      >
        {error}
      </div>
    );
  }

  if (!renderedHtml) return null;

  return (
    <div
      className="w-full p-4 rounded-lg"
    >
      <div
        className="text-center [&_.katex]:text-white/90 [&_.katex-display]:text-white/95 [&_.katex-display]:my-2"
        style={{
          fontSize: '1.3rem',
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  );
};

// Shared Components
const DottedBackground = ({ opacity = 0.04, size = '80px' }) => (
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: `radial-gradient(circle, ${fridayConfig.colors.muted} 1px, transparent 1px)`,
      backgroundSize: `${size} ${size}`,
      opacity
    }}
  />
);

const SlideContainer = ({ children, dotSize = '80px' }) => (
  <div
    className="w-full h-full flex items-center justify-center relative overflow-hidden"
    style={{
      backgroundColor: fridayConfig.colors.background,
      minHeight: '100vh'
    }}
  >
    <DottedBackground size={dotSize} />
    <div className="relative z-10 w-full h-full flex items-center justify-center px-12 py-8">
      {children}
    </div>
  </div>
);

const Accent = ({ className = '' }) => (
  <div
    className={`w-20 h-0.5 ${className}`}
    style={{ backgroundColor: fridayConfig.colors.primary }}
  />
);

// Content Renderer
export const ContentRenderer = ({ content }) => {
  if (!content) return null;

  switch (content.type) {
    case 'text':
      return (
        <div
          className="leading-relaxed max-w-full"
          style={{
            color: content.muted ? fridayConfig.colors.muted : fridayConfig.colors.white,
            fontSize: fridayConfig.typography[content.size || 'body'],
            lineHeight: '1.6'
          }}
        >
          {content.value}
        </div>
      );

    case 'code':
      return (
        <FridayCodeBlock
          content={content.value}
          language={content.language || 'text'}
          comment={content.comment}
        />
      );

    case 'ascii-art':
      return (
        <div
          className="font-mono text-center max-w-full"
          style={{
            color: fridayConfig.colors.white,
            fontSize: '1.3rem',
            lineHeight: '1.2'
          }}
        >
          <pre style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {content.value}
          </pre>
        </div>
      );

    case 'mermaid':
    case 'diagram':
      return <FridayMermaid chart={content.value} />;

    case 'latex':
      return <FridayLatex content={content.value} />;

    case 'list':
      return (
        <div className="space-y-3 max-w-full">
          {content.items?.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: fridayConfig.colors.primary }}
              />
              <div
                style={{
                  color: fridayConfig.colors.white,
                  fontSize: fridayConfig.typography.body,
                  lineHeight: '1.6'
                }}
              >
                {item}
              </div>
            </div>
          ))}
        </div>
      );

    case 'highlight-box':
      return (
        <div
          className="rounded-lg p-4 max-w-full"
          style={{
            backgroundColor: content.primary ? fridayConfig.colors.primary : fridayConfig.colors.hover,
            border: `1px solid ${fridayConfig.colors.border}`,
            color: content.primary ? fridayConfig.colors.background : fridayConfig.colors.white,
            fontSize: fridayConfig.typography.body
          }}
        >
          <FridayMarkdown content={content.value} />

        </div>
      );

    case 'markdown':
      return (
        <div
          className="max-w-full"
          style={{
            color: fridayConfig.colors.white,
            fontSize: fridayConfig.typography.body,
            lineHeight: '1.6'
          }}
        >
          <FridayMarkdown content={content.value} />

        </div>
      );
    case "meme":
      return (
        <div>
          <img src={content.url} />
        </div>

      )

    default:
      return (
        <div
          className="max-w-full"
          style={{
            color: fridayConfig.colors.white,
            fontSize: fridayConfig.typography.body
          }}
        >
          {content.value}
        </div>
      );
  }
};

// Template Components
export const HeroSlide = ({ title, subtitle, highlight, description }) => (
  <SlideContainer dotSize="100px">
    <div className="w-full text-center space-y-6">
      {subtitle && (
        <div
          className="font-mono text-base tracking-wider uppercase"
          style={{ color: fridayConfig.colors.muted }}
        >
          {subtitle}
        </div>
      )}

      <div>
        <h1
          className="font-light tracking-tight mb-4"
          style={{
            fontSize: fridayConfig.typography.hero,
            color: fridayConfig.colors.white
          }}
        >
          {title}
        </h1>
        <div className="flex justify-center">
          <Accent />
        </div>
      </div>

      {highlight && (
        <div
          className="inline-block px-6 py-3 rounded-lg font-medium text-lg"
          style={{
            backgroundColor: fridayConfig.colors.primary,
            color: fridayConfig.colors.background
          }}
        >
          {highlight}
        </div>
      )}

      {description && (
        <div
          className="max-w-3xl mx-auto"
          style={{
            color: fridayConfig.colors.muted,
            fontSize: fridayConfig.typography.body
          }}
        >
          {description}
        </div>
      )}
    </div>
  </SlideContainer>
);

export const ConceptSlide = ({ title, mainContent, supportingVisual, accent }) => (
  <SlideContainer>
    <div className="w-full">
      <div className="mb-8">
        <h1
          className="font-light mb-3"
          style={{
            fontSize: fridayConfig.typography.h1,
            color: fridayConfig.colors.white
          }}
        >
          {title}
        </h1>
        <Accent />
      </div>

      <div className="grid grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <ContentRenderer content={mainContent} />
          {accent && (
            <div
              className="px-4 py-3 rounded-lg"
              style={{
                backgroundColor: fridayConfig.colors.hover,
                border: `1px solid ${fridayConfig.colors.border}`
              }}
            >
              <ContentRenderer content={accent} />
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <ContentRenderer content={supportingVisual} />
        </div>
      </div>
    </div>
  </SlideContainer>
);

export const CodeDemoSlide = ({ title, codeBlock, explanation, note }) => (
  <SlideContainer>
    <div className="w-full">
      <div className="mb-8">
        <h1
          className="font-light mb-3"
          style={{
            fontSize: fridayConfig.typography.h1,
            color: fridayConfig.colors.white
          }}
        >
          {title}
        </h1>
        <Accent />
      </div>

      <div className="space-y-6">
        <ContentRenderer content={codeBlock} />

        {explanation && (
          <div>
            <ContentRenderer content={explanation} />
          </div>
        )}

        {note && (
          <div
            className="px-4 py-3 rounded-lg text-center"
            style={{
              backgroundColor: fridayConfig.colors.hover,
              border: `1px solid ${fridayConfig.colors.border}`,
              color: fridayConfig.colors.primary
            }}
          >
            {note}
          </div>
        )}
      </div>
    </div>
  </SlideContainer>
);

export const TwoColumnSlide = ({ title, leftContent, rightContent }) => (
  <SlideContainer>
    <div className="w-full">
      <div className="mb-8">
        <h1
          className="font-light mb-3"
          style={{
            fontSize: fridayConfig.typography.h1,
            color: fridayConfig.colors.white
          }}
        >
          {title}
        </h1>
        <Accent />
      </div>

      <div className="grid grid-cols-2 gap-12">
        <div>
          <ContentRenderer content={leftContent} />
        </div>
        <div>
          <ContentRenderer content={rightContent} />
        </div>
      </div>
    </div>
  </SlideContainer>
);

export const ComparisonSlide = ({ title, leftTitle, rightTitle, leftContent, rightContent, leftColor, rightColor }) => (
  <SlideContainer>
    <div className="w-full">
      <div className="mb-8">
        <h1
          className="font-light mb-3"
          style={{
            fontSize: fridayConfig.typography.h1,
            color: fridayConfig.colors.white
          }}
        >
          {title}
        </h1>
        <Accent />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: fridayConfig.colors.hover,
            border: `2px solid ${leftColor || fridayConfig.colors.primary}`
          }}
        >
          <h3
            className="font-medium mb-4"
            style={{
              color: leftColor || fridayConfig.colors.primary,
              fontSize: fridayConfig.typography.h3
            }}
          >
            {leftTitle}
          </h3>
          <ContentRenderer content={leftContent} />
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: fridayConfig.colors.hover,
            border: `2px solid ${rightColor || fridayConfig.colors.muted}`
          }}
        >
          <h3
            className="font-medium mb-4"
            style={{
              color: rightColor || fridayConfig.colors.muted,
              fontSize: fridayConfig.typography.h3
            }}
          >
            {rightTitle}
          </h3>
          <ContentRenderer content={rightContent} />
        </div>
      </div>
    </div>
  </SlideContainer>
);

export const ApplicationSlide = ({ title, applications }) => (
  <SlideContainer>
    <div className="w-full">
      <div className="mb-8">
        <h1
          className="font-light mb-3"
          style={{
            fontSize: fridayConfig.typography.h1,
            color: fridayConfig.colors.white
          }}
        >
          {title}
        </h1>
        <Accent />
      </div>

      <div className="grid grid-cols-2 gap-8">
        {applications?.map((app, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: fridayConfig.colors.primary }}
              />
              <h3
                className="font-medium"
                style={{
                  color: fridayConfig.colors.white,
                  fontSize: fridayConfig.typography.h3
                }}
              >
                {app.title}
              </h3>
            </div>
            <div
              style={{
                color: fridayConfig.colors.muted,
                fontSize: fridayConfig.typography.body,
                lineHeight: '1.5'
              }}
            >
              {app.description}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <div
          className="inline-block px-6 py-3 rounded-lg"
          style={{
            backgroundColor: fridayConfig.colors.hover,
            border: `1px solid ${fridayConfig.colors.border}`
          }}
        >
          <span style={{ color: fridayConfig.colors.muted }}>Pattern: </span>
          <span style={{ color: fridayConfig.colors.white }}>
            Common thread connecting all use cases
          </span>
        </div>
      </div>
    </div>
  </SlideContainer>
);

export const SummarySlide = ({ title, keyPoints, nextSteps, highlight }) => (
  <SlideContainer dotSize="100px">
    <div className="w-full text-center">
      <div className="mb-12">
        <h1
          className="font-light mb-4"
          style={{
            fontSize: fridayConfig.typography.hero,
            color: fridayConfig.colors.white
          }}
        >
          {title}
        </h1>
        <div className="flex justify-center">
          <div
            className="w-24 h-0.5"
            style={{ backgroundColor: fridayConfig.colors.primary }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-12">
        {keyPoints?.map((point, index) => (
          <div key={index} className="text-center">
            <div
              className="text-2xl font-mono mb-2"
              style={{ color: fridayConfig.colors.white }}
            >
              {point.label}
            </div>
            <div
              style={{ color: fridayConfig.colors.muted, fontSize: fridayConfig.typography.small }}
            >
              {point.description}
            </div>
          </div>
        ))}
      </div>

      {highlight && (
        <div className="space-y-6">
          <div
            className="inline-block px-8 py-4 rounded-lg"
            style={{
              backgroundColor: fridayConfig.colors.hover,
              border: `1px solid ${fridayConfig.colors.border}`
            }}
          >
            <div
              className="text-lg mb-2"
              style={{ color: fridayConfig.colors.white }}
            >
              {highlight.title}
            </div>
            <div
              style={{ color: fridayConfig.colors.muted, fontSize: fridayConfig.typography.body }}
            >
              {highlight.description}
            </div>
          </div>
        </div>
      )}

      {nextSteps && (
        <div className="mt-12">
          <div
            className="text-lg"
            style={{ color: fridayConfig.colors.white }}
          >
            Next: <span style={{ color: fridayConfig.colors.primary }}>{nextSteps}</span>
          </div>
        </div>
      )}
    </div>
  </SlideContainer>
);

export const TextFocusSlide = ({ title, content, quote, author }) => (
  <SlideContainer>
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1
          className="font-light mb-3"
          style={{
            fontSize: fridayConfig.typography.h1,
            color: fridayConfig.colors.white
          }}
        >
          {title}
        </h1>
        <Accent />
      </div>

      <div className="space-y-8">
        <ContentRenderer content={content} />

        {quote && (
          <div className="text-center py-6">
            <div
              className="text-xl italic mb-3"
              style={{ color: fridayConfig.colors.primary }}
            >
              "{quote}"
            </div>
            {author && (
              <div
                style={{ color: fridayConfig.colors.muted, fontSize: fridayConfig.typography.body }}
              >
                — {author}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </SlideContainer>
);

export const VisualFocusSlide = ({ title, visual, caption, context }) => (
  <SlideContainer>
    <div className="w-full">
      <div className="mb-8">
        <h1
          className="font-light mb-3"
          style={{
            fontSize: fridayConfig.typography.h1,
            color: fridayConfig.colors.white
          }}
        >
          {title}
        </h1>
        <Accent />
      </div>

      <div className="flex items-center justify-center">
        <div className="text-center space-y-6">
          <div>
            <ContentRenderer content={visual} />
          </div>

          {caption && (
            <div
              className="text-lg"
              style={{ color: fridayConfig.colors.primary }}
            >
              {caption}
            </div>
          )}

          {context && (
            <div
              className="max-w-2xl mx-auto"
              style={{ color: fridayConfig.colors.muted, fontSize: fridayConfig.typography.body }}
            >
              {context}
            </div>
          )}
        </div>
      </div>
    </div>
  </SlideContainer>
);

export const StepByStepSlide = ({ title, steps, currentStep }) => (
  <SlideContainer>
    <div className="w-full">
      <div className="mb-8">
        <h1
          className="font-light mb-3"
          style={{
            fontSize: fridayConfig.typography.h1,
            color: fridayConfig.colors.white
          }}
        >
          {title}
        </h1>
        <Accent />
      </div>

      <div className="space-y-4">
        {steps?.map((step, index) => (
          <div
            key={index}
            className={`flex items-start gap-4 p-4 rounded-lg transition-all ${currentStep === index ? 'ring-1' : ''
              }`}
            style={{
              backgroundColor: currentStep === index ? fridayConfig.colors.hover : 'transparent',
              border: `1px solid ${currentStep === index ? fridayConfig.colors.primary : fridayConfig.colors.border}`,
            }}
          >
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm"
              style={{
                backgroundColor: currentStep === index ? fridayConfig.colors.primary : fridayConfig.colors.hover,
                color: currentStep === index ? fridayConfig.colors.background : fridayConfig.colors.white
              }}
            >
              {index + 1}
            </div>
            <div className="flex-1">
              <h3
                className="font-medium mb-2"
                style={{
                  color: fridayConfig.colors.white,
                  fontSize: fridayConfig.typography.h3
                }}
              >
                {step.title}
              </h3>
              <div
                style={{
                  color: fridayConfig.colors.muted,
                  fontSize: fridayConfig.typography.body
                }}
              >
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </SlideContainer>
);

export const templates = {
  hero: HeroSlide,
  concept: ConceptSlide,
  'code-demo': CodeDemoSlide,
  'two-column': TwoColumnSlide,
  comparison: ComparisonSlide,
  application: ApplicationSlide,
  summary: SummarySlide,
  'text-focus': TextFocusSlide,
  'visual-focus': VisualFocusSlide,
  'step-by-step': StepByStepSlide
};

export const SlideEngine = ({ slideData }) => {
  const TemplateComponent = templates[slideData.template];
  if (!TemplateComponent) {
    return (
      <div style={{ color: 'red', padding: '2rem' }}>
        Template "{slideData.template}" not found
      </div>
    );
  }
  return <TemplateComponent {...slideData.props} />;
};

