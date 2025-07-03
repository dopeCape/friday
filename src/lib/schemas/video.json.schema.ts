export const videoSlideGenerationDataSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SlideData",
  "type": "object",
  "required": ["template", "props"],
  "properties": {
    "template": {
      "type": "string",
      "enum": [
        "hero",
        "concept",
        "code-demo",
        "two-column",
        "comparison",
        "application",
        "summary",
        "text-focus",
        "visual-focus",
        "step-by-step"
      ]
    },
    "props": {
      "type": "object",
      "anyOf": [
        {
          "title": "HeroSlideProps",
          "type": "object",
          "required": ["title"],
          "properties": {
            "title": { "type": "string" },
            "subtitle": {
              "type": "string",
              "description": "Optional: category or section label"
            },
            "highlight": {
              "type": "string",
              "description": "Optional: key concept or value proposition"
            },
            "description": {
              "type": "string",
              "description": "Optional: supporting description"
            }
          },
          "additionalProperties": false
        },
        {
          "title": "ConceptSlideProps",
          "type": "object",
          "required": ["title", "mainContent"],
          "properties": {
            "title": { "type": "string" },
            "mainContent": { "$ref": "#/definitions/Content" },
            "supportingVisual": { "$ref": "#/definitions/Content" },
            "accent": { "$ref": "#/definitions/Content" }
          },
          "additionalProperties": false
        },
        {
          "title": "CodeDemoSlideProps",
          "type": "object",
          "required": ["title", "codeBlock"],
          "properties": {
            "title": { "type": "string" },
            "codeBlock": { "$ref": "#/definitions/CodeContent" },
            "explanation": {
              "$ref": "#/definitions/Content",
              "description": "Optional: explanation of the code"
            },
            "note": {
              "type": "string",
              "description": "Optional: important note or callout"
            }
          },
          "additionalProperties": false
        },
        {
          "title": "VisualFocusSlideProps",
          "type": "object",
          "required": ["title", "visual"],
          "properties": {
            "title": { "type": "string" },
            "visual": { "$ref": "#/definitions/Content" },
            "caption": {
              "type": "string",
              "description": "Optional: caption explaining the visual"
            },
            "context": {
              "type": "string",
              "description": "Optional: additional context"
            }
          },
          "additionalProperties": false
        },
        {
          "title": "ApplicationSlideProps",
          "type": "object",
          "required": ["title", "applications"],
          "properties": {
            "title": { "type": "string" },
            "applications": {
              "type": "array",
              "minItems": 1,
              "maxItems": 4,
              "items": {
                "type": "object",
                "required": ["title", "description"],
                "properties": {
                  "title": { "type": "string" },
                  "description": { "type": "string" }
                }
              }
            }
          },
          "additionalProperties": false
        },
        {
          "title": "SummarySlideProps",
          "type": "object",
          "required": ["title"],
          "properties": {
            "title": { "type": "string" },
            "keyPoints": {
              "type": "array",
              "description": "Optional: key takeaways to highlight",
              "items": {
                "type": "object",
                "required": ["label", "description"],
                "properties": {
                  "label": { "type": "string" },
                  "description": { "type": "string" }
                }
              }
            },
            "nextSteps": {
              "type": "string",
              "description": "Optional: what comes next"
            },
            "highlight": {
              "type": "object",
              "description": "Optional: featured callout box",
              "required": ["title", "description"],
              "properties": {
                "title": { "type": "string" },
                "description": { "type": "string" }
              }
            }
          },
          "additionalProperties": false
        },
        {
          "title": "ComparisonSlideProps",
          "type": "object",
          "required": ["title", "leftTitle", "rightTitle", "leftContent", "rightContent"],
          "properties": {
            "title": { "type": "string" },
            "leftTitle": { "type": "string" },
            "rightTitle": { "type": "string" },
            "leftContent": { "$ref": "#/definitions/Content" },
            "rightContent": { "$ref": "#/definitions/Content" },
            "leftColor": {
              "type": "string",
              "description": "Optional: border color for left side (defaults to primary)"
            },
            "rightColor": {
              "type": "string",
              "description": "Optional: border color for right side (defaults to muted)"
            }
          },
          "additionalProperties": false
        },
        {
          "title": "TwoColumnSlideProps",
          "type": "object",
          "required": ["title", "leftContent", "rightContent"],
          "properties": {
            "title": { "type": "string" },
            "leftContent": { "$ref": "#/definitions/Content" },
            "rightContent": { "$ref": "#/definitions/Content" }
          },
          "additionalProperties": false
        },
        {
          "title": "TextFocusSlideProps",
          "type": "object",
          "required": ["title", "content"],
          "properties": {
            "title": { "type": "string" },
            "content": { "$ref": "#/definitions/Content" },
            "quote": {
              "type": "string",
              "description": "Optional: featured quote"
            },
            "author": {
              "type": "string",
              "description": "Optional: quote author"
            }
          },
          "additionalProperties": false
        },
        {
          "title": "StepByStepSlideProps",
          "type": "object",
          "required": ["title", "steps"],
          "properties": {
            "title": { "type": "string" },
            "steps": {
              "type": "array",
              "minItems": 2,
              "maxItems": 6,
              "items": {
                "type": "object",
                "required": ["title", "description"],
                "properties": {
                  "title": { "type": "string" },
                  "description": { "type": "string" }
                }
              }
            },
            "currentStep": {
              "type": "number",
              "description": "Optional: highlights a specific step (0-based index)"
            }
          },
          "additionalProperties": false
        }
      ]
    }
  },
  "definitions": {
    "Content": {
      "anyOf": [
        {
          "title": "TextContent",
          "type": "object",
          "required": ["type", "value"],
          "properties": {
            "type": { "const": "text" },
            "value": { "type": "string" },
            "size": { "$ref": "#/definitions/TextSize" },
            "muted": { "type": "boolean" },
            "primary": { "type": "boolean" }
          },
          "additionalProperties": false
        },
        {
          "title": "CodeContent",
          "type": "object",
          "required": ["type", "value", "language"],
          "properties": {
            "type": { "const": "code" },
            "value": { "type": "string" },
            "language": { "$ref": "#/definitions/ProgrammingLanguage" },
            "comment": { "type": "string" }
          },
          "additionalProperties": false
        },
        {
          "title": "ListContent",
          "type": "object",
          "required": ["type", "items"],
          "properties": {
            "type": { "const": "list" },
            "items": {
              "type": "array",
              "items": { "type": "string" },
              "minItems": 1,
              "maxItems": 8
            }
          },
          "additionalProperties": false
        },
        {
          "title": "MermaidContent",
          "type": "object",
          "required": ["type", "value"],
          "properties": {
            "type": { "const": "mermaid" },
            "value": { "type": "string" }
          },
          "additionalProperties": false
        },
        {
          "title": "LatexContent",
          "type": "object",
          "required": ["type", "value"],
          "properties": {
            "type": { "const": "latex" },
            "value": { "type": "string" }
          },
          "additionalProperties": false
        },
        {
          "title": "AsciiArtContent",
          "type": "object",
          "required": ["type", "value"],
          "properties": {
            "type": { "const": "ascii-art" },
            "value": { "type": "string" }
          },
          "additionalProperties": false
        },
        {
          "title": "DiagramContent",
          "type": "object",
          "required": ["type", "value"],
          "properties": {
            "type": { "const": "diagram" },
            "value": { "type": "string" }
          },
          "additionalProperties": false
        },
        {
          "title": "HighlightBoxContent",
          "type": "object",
          "required": ["type", "value"],
          "properties": {
            "type": { "const": "highlight-box" },
            "value": { "type": "string" },
            "primary": { "type": "boolean" }
          },
          "additionalProperties": false
        },
        {
          "title": "MarkdownContent",
          "type": "object",
          "required": ["type", "value"],
          "properties": {
            "type": { "const": "markdown" },
            "value": { "type": "string" }
          },
          "additionalProperties": false
        }
      ]
    },
    "CodeContent": {
      "type": "object",
      "required": ["type", "value", "language"],
      "properties": {
        "type": { "const": "code" },
        "value": { "type": "string" },
        "language": { "$ref": "#/definitions/ProgrammingLanguage" },
        "comment": { "type": "string" }
      },
      "additionalProperties": false
    },
    "ProgrammingLanguage": {
      "type": "string",
      "enum": [
        "javascript", "typescript", "python", "rust", "go", "java",
        "cpp", "c", "csharp", "php", "ruby", "swift", "kotlin",
        "html", "css", "sql", "bash", "powershell", "yaml", "json",
        "dockerfile", "markdown", "xml"
      ]
    },
    "TextSize": {
      "type": "string",
      "enum": ["small", "body", "h3", "h2", "h1", "hero"]
    }
  }
}
