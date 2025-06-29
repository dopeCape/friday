import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import katex from 'katex';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';

// Style Configuration for Video
export const videoConfig = {
  colors: {
    background: '#07080A',
    hover: '#0C0D0F',
    muted: '#666768',
    primary: '#63a1ff',
    white: '#ffffff',
    border: '#1a1b1e'
  },
  spacing: {
    xs: '1rem',
    sm: '2rem',
    md: '3rem',
    lg: '4rem',
    xl: '6rem',
    xxl: '8rem'
  },
  typography: {
    hero: '6rem',
    h1: '4rem',
    h2: '3rem',
    h3: '2rem',
    body: '1.75rem',
    small: '1.5rem',
    code: '1.5rem'
  }
};

// Video-Optimized Friday Components
const VideoCodeBlock = ({ content, language = 'text', comment }) => {
  const customStyle = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: 'transparent',
      border: 'none',
      borderRadius: 0,
      margin: 0,
      padding: '2.5rem',
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: videoConfig.typography.code,
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowWrap: 'break-word'
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: videoConfig.typography.code,
      color: 'rgba(255, 255, 255, 0.95)',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }
  };

  return (
    <div className="w-full">
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: videoConfig.colors.hover,
          border: `2px solid ${videoConfig.colors.border}`,
          maxWidth: '100%'
        }}
      >
        {comment && (
          <div className="px-6 py-4 border-b border-white/[0.08]">
            <span
              className="text-lg font-mono"
              style={{ color: videoConfig.colors.muted }}
            >
              # {comment}
            </span>
          </div>
        )}
        <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
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

const VideoMermaid = ({ chart }) => {
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
            primaryColor: videoConfig.colors.primary,
            primaryTextColor: videoConfig.colors.white,
            primaryBorderColor: videoConfig.colors.primary,
            lineColor: videoConfig.colors.primary,
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
            nodeTextColor: videoConfig.colors.white,
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
          fontSize: 18,
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
        className="text-center py-12 rounded-lg"
        style={{
          backgroundColor: videoConfig.colors.hover,
          border: `1px solid ${videoConfig.colors.border}`,
          color: videoConfig.colors.muted
        }}
      >
        {error}
      </div>
    );
  }

  if (!svg) return null;

  return (
    <div
      className="w-full p-8 rounded-lg"
      style={{
        backgroundColor: videoConfig.colors.hover,
        border: `1px solid ${videoConfig.colors.border}`,
        maxWidth: '100%'
      }}
    >
      <div
        className="text-center [&_svg]:max-w-full [&_svg]:h-auto [&_text]:fill-white/85 [&_rect]:stroke-[#63a1ff]/25 [&_path]:stroke-[#63a1ff]/40"
        style={{ maxHeight: '70vh', overflow: 'auto' }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};

const VideoLatex = ({ content }) => {
  const [renderedHtml, setRenderedHtml] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const renderLatex = async () => {
      try {
        let processedContent = content.trim();

        if (!processedContent.includes('

// Shared Components
const DottedBackground = ({ opacity = 0.05, size = '100px' }) => (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle, ${videoConfig.colors.muted} 1px, transparent 1px)`,
                backgroundSize: `${size} ${size}`,
                opacity
              }}
            />
          );

        const VideoSlideContainer = ({ children, dotSize = '100px' }) => (
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{
              backgroundColor: videoConfig.colors.background,
              minHeight: '100vh'
            }}
          >
            <DottedBackground size={dotSize} />
            <div className="relative z-10 w-full h-full flex items-center justify-center px-24 py-16">
              {children}
            </div>
          </div>
        );

        const VideoAccent = ({ className = '' }) => (
          <div
            className={`w-32 h-1 ${className}`}
            style={{ backgroundColor: videoConfig.colors.primary }}
          />
        );

        // Content Renderer for Video
        export const VideoContentRenderer = ({ content }) => {
          if (!content) return null;

          switch (content.type) {
            case 'text':
              return (
                <div
                  className="leading-relaxed max-w-full"
                  style={{
                    color: content.muted ? videoConfig.colors.muted : videoConfig.colors.white,
                    fontSize: videoConfig.typography[content.size || 'body'],
                    lineHeight: '1.7'
                  }}
                >
                  {content.value}
                </div>
              );

            case 'code':
              return (
                <VideoCodeBlock
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
                    color: videoConfig.colors.white,
                    fontSize: '2rem',
                    lineHeight: '1.3'
                  }}
                >
                  <pre style={{
                    maxHeight: '70vh',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {content.value}
                  </pre>
                </div>
              );

            case 'mermaid':
            case 'diagram':
              return <VideoMermaid chart={content.value} />;

            case 'latex':
              return <VideoLatex content={content.value} />;

            case 'list':
              return (
                <div className="space-y-4 max-w-full">
                  {content.items?.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className="w-3 h-3 rounded-full mt-3 flex-shrink-0"
                        style={{ backgroundColor: videoConfig.colors.primary }}
                      />
                      <div
                        style={{
                          color: videoConfig.colors.white,
                          fontSize: videoConfig.typography.body,
                          lineHeight: '1.7'
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
                  className="rounded-lg p-8 max-w-full"
                  style={{
                    backgroundColor: content.primary ? videoConfig.colors.primary : videoConfig.colors.hover,
                    border: `2px solid ${videoConfig.colors.border}`,
                    color: content.primary ? videoConfig.colors.background : videoConfig.colors.white,
                    fontSize: videoConfig.typography.body
                  }}
                >
                  {content.value}
                </div>
              );

            case 'markdown':
              return (
                <div
                  className="max-w-full"
                  style={{
                    color: videoConfig.colors.white,
                    fontSize: videoConfig.typography.body,
                    lineHeight: '1.7'
                  }}
                >
                  {content.value.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <div key={i} className="font-bold mb-3" style={{ fontSize: videoConfig.typography.h3 }}>
                          {line.slice(2, -2)}
                        </div>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <div key={i} className="flex items-start gap-4 mb-3">
                          <div
                            className="w-2 h-2 rounded-full mt-4"
                            style={{ backgroundColor: videoConfig.colors.primary }}
                          />
                          <div>{line.slice(2)}</div>
                        </div>
                      );
                    }
                    return line ? <div key={i} className="mb-4">{line}</div> : <div key={i} className="mb-4" />;
                  })}
                </div>
              );

            default:
              return (
                <div
                  className="max-w-full"
                  style={{
                    color: videoConfig.colors.white,
                    fontSize: videoConfig.typography.body
                  }}
                >
                  {content.value}
                </div>
              );
          }
        };

        // Video Template Components
        export const VideoHeroSlide = ({ title, subtitle, highlight, description }) => (
          <VideoSlideContainer dotSize="120px">
            <div className="w-full text-center space-y-12">
              {subtitle && (
                <div
                  className="font-mono text-xl tracking-wider uppercase"
                  style={{ color: videoConfig.colors.muted }}
                >
                  {subtitle}
                </div>
              )}

              <div>
                <h1
                  className="font-light tracking-tight mb-8"
                  style={{
                    fontSize: videoConfig.typography.hero,
                    color: videoConfig.colors.white
                  }}
                >
                  {title}
                </h1>
                <div className="flex justify-center">
                  <VideoAccent />
                </div>
              </div>

              {highlight && (
                <div
                  className="inline-block px-10 py-5 rounded-lg font-medium text-2xl"
                  style={{
                    backgroundColor: videoConfig.colors.primary,
                    color: videoConfig.colors.background
                  }}
                >
                  {highlight}
                </div>
              )}

              {description && (
                <div
                  style={{
                    color: videoConfig.colors.muted,
                    fontSize: videoConfig.typography.body,
                    maxWidth: '1200px',
                    margin: '0 auto'
                  }}
                >
                  {description}
                </div>
              )}
            </div>
          </VideoSlideContainer>
        );

        export const VideoConceptSlide = ({ title, mainContent, supportingVisual }) => (
          <VideoSlideContainer>
            <div className="w-full">
              <div className="mb-16">
                <h1
                  className="font-light mb-6"
                  style={{
                    fontSize: videoConfig.typography.h1,
                    color: videoConfig.colors.white
                  }}
                >
                  {title}
                </h1>
                <VideoAccent />
              </div>

              <div className="grid grid-cols-2 gap-24 items-center">
                <div className="space-y-8">
                  <VideoContentRenderer content={mainContent} />
                </div>

                <div className="flex justify-center">
                  <VideoContentRenderer content={supportingVisual} />
                </div>
              </div>
            </div>
          </VideoSlideContainer>
        );

        // Template Registry
        export const videoTemplates = {
          hero: VideoHeroSlide,
          concept: VideoConceptSlide
        };

        // Template Engine
        export const VideoSlideEngine = ({ slideData }) => {
          const TemplateComponent = videoTemplates[slideData.template];

          if (!TemplateComponent) {
            return (
              <div style={{ color: 'red', padding: '2rem' }}>
                Video Template "{slideData.template}" not found
              </div>
            );
          }

          return <TemplateComponent {...slideData.props} />;
        };)) {
    processedContent = `$${processedContent}$`;
  }

  if (processedContent.startsWith('$') && processedContent.endsWith('$')) {
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

    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
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

    html = html.replace(/\$([^$\n]+)\$/g, (match, math) => {
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
      className="text-center py-8 rounded-lg"
      style={{
        backgroundColor: videoConfig.colors.hover,
        border: `1px solid ${videoConfig.colors.border}`,
        color: videoConfig.colors.muted
      }}
    >
      {error}
    </div>
  );
}

if (!renderedHtml) return null;

return (
  <div
    className="w-full p-8 rounded-lg"
    style={{
      backgroundColor: videoConfig.colors.hover,
      border: `1px solid ${videoConfig.colors.border}`,
      maxWidth: '100%'
    }}
  >
    <div
      className="text-center [&_.katex]:text-white/90 [&_.katex-display]:text-white/95 [&_.katex-display]:my-4"
      style={{
        fontSize: '1.8rem',
        maxHeight: '70vh',
        overflow: 'auto',
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  </div>
);
};

// Shared Components
const DottedBackground = ({ opacity = 0.05, size = '100px' }) => (
  <div
    className="absolute inset-0"
    style={{
      backgroundImage: `radial-gradient(circle, ${videoConfig.colors.muted} 1px, transparent 1px)`,
      backgroundSize: `${size} ${size}`,
      opacity
    }}
  />
);

const VideoSlideContainer = ({ children, dotSize = '100px' }) => (
  <div
    className="flex items-center justify-center relative overflow-hidden"
    style={{
      backgroundColor: videoConfig.colors.background,
      width: videoConfig.video.width,
      height: videoConfig.video.height
    }}
  >
    <DottedBackground size={dotSize} />
    <div
      className="relative z-10 w-full h-full flex items-center justify-center px-24"
      style={{ maxWidth: videoConfig.video.maxContentWidth }}
    >
      {children}
    </div>
  </div>
);

const VideoAccent = ({ className = '' }) => (
  <div
    className={`w-32 h-1 ${className}`}
    style={{ backgroundColor: videoConfig.colors.primary }}
  />
);

// Content Renderer for Video
export const VideoContentRenderer = ({ content }) => {
  if (!content) return null;

  switch (content.type) {
    case 'text':
      return (
        <div
          className="leading-relaxed"
          style={{
            color: content.muted ? videoConfig.colors.muted : videoConfig.colors.white,
            fontSize: videoConfig.typography[content.size || 'body'],
            lineHeight: '1.7',
            maxWidth: videoConfig.video.maxContentWidth
          }}
        >
          {content.value}
        </div>
      );

    case 'code':
      return (
        <VideoCodeBlock
          content={content.value}
          language={content.language || 'text'}
          comment={content.comment}
        />
      );

    case 'ascii-art':
      return (
        <div
          className="font-mono text-center"
          style={{
            color: videoConfig.colors.white,
            fontSize: '2rem',
            lineHeight: '1.3',
            maxWidth: videoConfig.video.maxContentWidth
          }}
        >
          <pre style={{ maxHeight: videoConfig.video.maxContentHeight, overflow: 'hidden' }}>
            {content.value}
          </pre>
        </div>
      );

    case 'mermaid':
    case 'diagram':
      return <VideoMermaid chart={content.value} />;

    case 'latex':
      return <VideoLatex content={content.value} />;

    case 'list':
      return (
        <div
          className="space-y-4"
          style={{ maxWidth: videoConfig.video.maxContentWidth }}
        >
          {content.items?.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <div
                className="w-3 h-3 rounded-full mt-3 flex-shrink-0"
                style={{ backgroundColor: videoConfig.colors.primary }}
              />
              <div
                style={{
                  color: videoConfig.colors.white,
                  fontSize: videoConfig.typography.body,
                  lineHeight: '1.7'
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
          className="rounded-lg p-8"
          style={{
            backgroundColor: content.primary ? videoConfig.colors.primary : videoConfig.colors.hover,
            border: `2px solid ${videoConfig.colors.border}`,
            color: content.primary ? videoConfig.colors.background : videoConfig.colors.white,
            fontSize: videoConfig.typography.body,
            maxWidth: videoConfig.video.maxContentWidth
          }}
        >
          {content.value}
        </div>
      );

    case 'markdown':
      return (
        <div
          style={{
            color: videoConfig.colors.white,
            fontSize: videoConfig.typography.body,
            lineHeight: '1.7',
            maxWidth: videoConfig.video.maxContentWidth
          }}
        >
          {content.value.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return (
                <div key={i} className="font-bold mb-3" style={{ fontSize: videoConfig.typography.h3 }}>
                  {line.slice(2, -2)}
                </div>
              );
            }
            if (line.startsWith('- ')) {
              return (
                <div key={i} className="flex items-start gap-4 mb-3">
                  <div
                    className="w-2 h-2 rounded-full mt-4"
                    style={{ backgroundColor: videoConfig.colors.primary }}
                  />
                  <div>{line.slice(2)}</div>
                </div>
              );
            }
            return line ? <div key={i} className="mb-4">{line}</div> : <div key={i} className="mb-4" />;
          })}
        </div>
      );

    default:
      return (
        <div
          style={{
            color: videoConfig.colors.white,
            fontSize: videoConfig.typography.body,
            maxWidth: videoConfig.video.maxContentWidth
          }}
        >
          {content.value}
        </div>
      );
  }
};

// Video Template Components
export const VideoHeroSlide = ({ title, subtitle, highlight, description }) => (
  <VideoSlideContainer dotSize="120px">
    <div className="w-full text-center space-y-12">
      {subtitle && (
        <div
          className="font-mono text-xl tracking-wider uppercase"
          style={{ color: videoConfig.colors.muted }}
        >
          {subtitle}
        </div>
      )}

      <div>
        <h1
          className="font-light tracking-tight mb-8"
          style={{
            fontSize: videoConfig.typography.hero,
            color: videoConfig.colors.white
          }}
        >
          {title}
        </h1>
        <div className="flex justify-center">
          <VideoAccent />
        </div>
      </div>

      {highlight && (
        <div
          className="inline-block px-10 py-5 rounded-lg font-medium text-2xl"
          style={{
            backgroundColor: videoConfig.colors.primary,
            color: videoConfig.colors.background
          }}
        >
          {highlight}
        </div>
      )}

      {description && (
        <div
          style={{
            color: videoConfig.colors.muted,
            fontSize: videoConfig.typography.body,
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          {description}
        </div>
      )}
    </div>
  </VideoSlideContainer>
);

export const VideoConceptSlide = ({ title, mainContent, supportingVisual }) => (
  <VideoSlideContainer>
    <div className="w-full">
      <div className="mb-16">
        <h1
          className="font-light mb-6"
          style={{
            fontSize: videoConfig.typography.h1,
            color: videoConfig.colors.white
          }}
        >
          {title}
        </h1>
        <VideoAccent />
      </div>

      <div className="grid grid-cols-2 gap-24 items-center">
        <div className="space-y-8">
          <VideoContentRenderer content={mainContent} />
        </div>

        <div className="flex justify-center">
          <VideoContentRenderer content={supportingVisual} />
        </div>
      </div>
    </div>
  </VideoSlideContainer>
);

// Template Registry
export const videoTemplates = {
  hero: VideoHeroSlide,
  concept: VideoConceptSlide
};

// Template Engine
export const VideoSlideEngine = ({ slideData }) => {
  const TemplateComponent = videoTemplates[slideData.template];

  if (!TemplateComponent) {
    return (
      <div style={{ color: 'red', padding: '2rem' }}>
        Video Template "{slideData.template}" not found
      </div>
    );
  }

  return <TemplateComponent {...slideData.props} />;
};
