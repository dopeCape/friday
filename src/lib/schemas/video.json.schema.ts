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
            "subtitle": { "type": "string" },
            "highlight": { "type": "string" },
            "description": { "type": "string" }
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
            "explanation": { "$ref": "#/definitions/Content" },
            "note": { "type": "string" }
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
            "caption": { "type": "string" },
            "context": { "type": "string" }
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
              "items": {
                "type": "object",
                "required": ["label", "description"],
                "properties": {
                  "label": { "type": "string" },
                  "description": { "type": "string" }
                }
              }
            },
            "nextSteps": { "type": "string" },
            "highlight": {
              "type": "object",
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
            "leftColor": { "type": "string" },
            "rightColor": { "type": "string" }
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
            "quote": { "type": "string" },
            "author": { "type": "string" }
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
              "items": {
                "type": "object",
                "required": ["title", "description"],
                "properties": {
                  "title": { "type": "string" },
                  "description": { "type": "string" }
                }
              }
            },
            "currentStep": { "type": "number" }
          },
          "additionalProperties": false
        }
      ]
    }
  },
  "definitions": {
    "Content": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "text",
            "code",
            "ascii-art",
            "mermaid",
            "diagram",
            "latex",
            "list",
            "highlight-box",
            "markdown",
            "meme"
          ]
        },
        "value": { "type": "string" },
        "language": { "type": "string" },
        "comment": { "type": "string" },
        "size": {
          "type": "string",
          "enum": ["small", "body", "h3", "h2", "h1", "hero"]
        },
        "muted": { "type": "boolean" },
        "primary": { "type": "boolean" },
        "items": {
          "type": "array",
          "items": { "type": "string" }
        },
        "query": { "type": "string" }
      },
      "additionalProperties": false
    },
    "CodeContent": {
      "type": "object",
      "required": ["type", "value"],
      "properties": {
        "type": { "const": "code" },
        "value": { "type": "string" },
        "language": { "type": "string" },
        "comment": { "type": "string" }
      },
      "additionalProperties": false
    }
  }
}
