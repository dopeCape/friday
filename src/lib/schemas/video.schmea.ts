import { z } from "zod";

export const videoScriptGenerationSchema = z.object({
  scripts: z.array(z.string()).describe("Script chuncked per slide"),
  title: z.string().describe("Title for video"),
})

const BaseContentSchema = z.object({
  type: z.string(),
});

const TextContentSchema = BaseContentSchema.extend({
  type: z.literal('text'),
  value: z.string(),
  size: z.enum(['small', 'body', 'h3', 'h2', 'h1', 'hero']).optional(),
  muted: z.boolean().optional(),
});

const CodeContentSchema = BaseContentSchema.extend({
  type: z.literal('code'),
  value: z.string(),
  language: z.string().optional().default('text'),
  comment: z.string().optional(),
});

const AsciiArtContentSchema = BaseContentSchema.extend({
  type: z.literal('ascii-art'),
  value: z.string(),
});

const MermaidContentSchema = BaseContentSchema.extend({
  type: z.union([z.literal('mermaid'), z.literal('diagram')]),
  value: z.string(),
});

const LatexContentSchema = BaseContentSchema.extend({
  type: z.literal('latex'),
  value: z.string(),
});

const ListContentSchema = BaseContentSchema.extend({
  type: z.literal('list'),
  items: z.array(z.string()),
});

const HighlightBoxContentSchema = BaseContentSchema.extend({
  type: z.literal('highlight-box'),
  value: z.string(),
  primary: z.boolean().optional(),
});

const MarkdownContentSchema = BaseContentSchema.extend({
  type: z.literal('markdown'),
  value: z.string(),
});

const MemeContentSchema = BaseContentSchema.extend({
  type: z.literal('meme'),
  query: z.string(),
});

// Union of all content types - using union instead of discriminatedUnion for better JSON Schema compatibility
const ContentSchema = z.union([
  TextContentSchema,
  CodeContentSchema,
  AsciiArtContentSchema,
  MermaidContentSchema,
  LatexContentSchema,
  ListContentSchema,
  HighlightBoxContentSchema,
  MarkdownContentSchema,
  MemeContentSchema,
]);

// Alternative: Flexible content schema for LLM compatibility
const FlexibleContentSchema = z.object({
  type: z.enum([
    'text', 'code', 'ascii-art', 'mermaid', 'diagram',
    'latex', 'list', 'highlight-box', 'markdown', 'meme'
  ]),
  value: z.string().optional(),
  language: z.string().optional(),
  comment: z.string().optional(),
  size: z.enum(['small', 'body', 'h3', 'h2', 'h1', 'hero']).optional(),
  muted: z.boolean().optional(),
  primary: z.boolean().optional(),
  items: z.array(z.string()).optional(),
  query: z.string().optional(),
}).refine((data) => {
  // Validate required fields based on type
  if (data.type === 'text' || data.type === 'code' || data.type === 'ascii-art' ||
    data.type === 'mermaid' || data.type === 'diagram' || data.type === 'latex' ||
    data.type === 'highlight-box' || data.type === 'markdown') {
    return !!data.value;
  }
  if (data.type === 'list') {
    return !!data.items && data.items.length > 0;
  }
  if (data.type === 'meme') {
    return !!data.query;
  }
  return true;
}, "Required fields missing based on content type");

// Template-specific prop schemas
const HeroSlidePropsSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  highlight: z.string().optional(),
  description: z.string().optional(),
});

const ConceptSlidePropsSchema = z.object({
  title: z.string(),
  mainContent: ContentSchema,
  supportingVisual: ContentSchema.optional(),
  accent: ContentSchema.optional(),
});

const CodeDemoSlidePropsSchema = z.object({
  title: z.string(),
  codeBlock: CodeContentSchema,
  explanation: ContentSchema.optional(),
  note: z.string().optional(),
});

const TwoColumnSlidePropsSchema = z.object({
  title: z.string(),
  leftContent: ContentSchema,
  rightContent: ContentSchema,
});

const ComparisonSlidePropsSchema = z.object({
  title: z.string(),
  leftTitle: z.string(),
  rightTitle: z.string(),
  leftContent: ContentSchema,
  rightContent: ContentSchema,
  leftColor: z.string().optional(),
  rightColor: z.string().optional(),
});

const ApplicationSlidePropsSchema = z.object({
  title: z.string(),
  applications: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
});

const SummarySlidePropsSchema = z.object({
  title: z.string(),
  keyPoints: z.array(z.object({
    label: z.string(),
    description: z.string(),
  })).optional(),
  nextSteps: z.string().optional(),
  highlight: z.object({
    title: z.string(),
    description: z.string(),
  }).optional(),
});

const TextFocusSlidePropsSchema = z.object({
  title: z.string(),
  content: ContentSchema,
  quote: z.string().optional(),
  author: z.string().optional(),
});

const VisualFocusSlidePropsSchema = z.object({
  title: z.string(),
  visual: ContentSchema,
  caption: z.string().optional(),
  context: z.string().optional(),
});

const StepByStepSlidePropsSchema = z.object({
  title: z.string(),
  steps: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
  currentStep: z.number().optional(),
});

export const videoSlideGenerationDataSchema = z.union([
  z.object({
    template: z.literal('hero'),
    props: HeroSlidePropsSchema,
  }),
  z.object({
    template: z.literal('concept'),
    props: ConceptSlidePropsSchema,
  }),
  z.object({
    template: z.literal('code-demo'),
    props: CodeDemoSlidePropsSchema,
  }),
  z.object({
    template: z.literal('two-column'),
    props: TwoColumnSlidePropsSchema,
  }),
  z.object({
    template: z.literal('comparison'),
    props: ComparisonSlidePropsSchema,
  }),
  z.object({
    template: z.literal('application'),
    props: ApplicationSlidePropsSchema,
  }),
  z.object({
    template: z.literal('summary'),
    props: SummarySlidePropsSchema,
  }),
  z.object({
    template: z.literal('text-focus'),
    props: TextFocusSlidePropsSchema,
  }),
  z.object({
    template: z.literal('visual-focus'),
    props: VisualFocusSlidePropsSchema,
  }),
  z.object({
    template: z.literal('step-by-step'),
    props: StepByStepSlidePropsSchema,
  }),
]);
