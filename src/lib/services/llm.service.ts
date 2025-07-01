import { ConverstionType, LLMOpts, Logger } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { BaseErrorHandler } from "../errorHandler/baseErrorHandler";
import { z, ZodDiscriminatedUnion, ZodObject, ZodUnion } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import env from "@/config/env.config";

type ZodToType<T extends ZodObject<any, any, any>> = z.infer<T>;

type LLMResponse<T extends ZodObject<any, any, any>> = {
  raw: string;
  parsed: z.infer<T>;
  usedFallback: boolean;
  fallbackMethod?: 'json_repair' | 'markdown_parse' | 'none';
}

export default class LLMService {
  private logger: Logger;
  private errorHandler: CentralErrorHandler;
  private static instance: LLMService | null;

  private constructor(logger: Logger, customErrorAdapter: BaseErrorHandler) {
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);
    this.errorHandler.registerHandler(customErrorAdapter);
  }

  public static getInstance(logger: Logger, customErrorAdapter: BaseErrorHandler) {
    if (!this.instance) {
      this.instance = new LLMService(logger, customErrorAdapter);
    }
    return this.instance;
  }

  async structuredResponse<T extends ZodObject<any, any, any> | ZodDiscriminatedUnion<any, any> | ZodUnion<any>>(
    input: string | ConverstionType,
    structure: T | Record<string, string>,
    opts: LLMOpts
  ): Promise<{ raw: string, parsed: z.infer<T> }> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Invoking structured response", { input, structure, opts });
      const model = this.getModel(opts);
      const structuredLlm = model.withStructuredOutput(structure, { includeRaw: true });
      const response = await structuredLlm.invoke(input);
      this.logger.info("response from llm", { input, response });
      return { raw: response.raw.text, parsed: response.parsed };
    }, {
      service: "LLMService",
      method: "structuredResponse"
    });
  }

  async structuredResponseWithFallback<T extends ZodObject<any, any, any>>(
    input: string | ConverstionType,
    structure: T,
    opts: LLMOpts
  ): Promise<LLMResponse<T>> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Invoking structured response with fallback", { input, structure, opts });

      const result = await this.structuredResponse(input, structure, opts);

      if (this.isParsingFailed(result.parsed)) {
        this.logger.warn("Structured parsing failed, attempting fallback methods", {
          raw: result.raw.substring(0, 200) + "..."
        });

        const repairedJson = this.repairAndParseJson(result.raw, structure);
        if (repairedJson) {
          this.logger.info("Successfully repaired and parsed JSON");
          return {
            raw: result.raw,
            parsed: repairedJson as z.infer<T>,
            usedFallback: true,
            fallbackMethod: 'json_repair'
          };
        }

        const parsedResponse = this.parseMarkdownToSchema(result.raw, structure);
        if (parsedResponse) {
          this.logger.info("Successfully parsed markdown to schema structure");
          return {
            raw: result.raw,
            parsed: parsedResponse as z.infer<T>,
            usedFallback: true,
            fallbackMethod: 'markdown_parse'
          };
        }

        this.logger.error("All parsing methods failed");
      }

      return {
        raw: result.raw,
        parsed: result.parsed,
        usedFallback: false,
        fallbackMethod: 'none'
      };
    }, {
      service: "LLMService",
      method: "structuredResponseWithFallback"
    });
  }

  private repairAndParseJson(text: string, structure: ZodObject<any, any, any>): any | null {
    try {
      this.logger.info("Attempting JSON repair and parsing");

      let jsonString = this.extractJsonFromText(text);
      if (!jsonString) {
        this.logger.debug("No JSON found in text");
        return null;
      }

      const repairStrategies = [
        (str: string) => str,
        (str: string) => this.fixCodeBlockEscaping(str),
        (str: string) => this.fixQuoteEscaping(str),
        (str: string) => this.fixNewlineEscaping(str),
        (str: string) => this.fixBackslashEscaping(str),
        (str: string) => this.fixAllEscaping(str)
      ];

      for (const repair of repairStrategies) {
        try {
          const repairedJson = repair(jsonString);
          const parsed = JSON.parse(repairedJson);

          const cleanedParsed = this.cleanupParsedContent(parsed);

          const validated = structure.safeParse(cleanedParsed);
          if (validated.success) {
            this.logger.info("Successfully repaired JSON with strategy", { strategy: repair.name });
            return validated.data;
          }
        } catch (e) {
          continue;
        }
      }

      this.logger.warn("All JSON repair strategies failed");
      return null;
    } catch (error) {
      this.logger.error("Error in JSON repair process", { error });
      return null;
    }
  }

  private cleanupParsedContent(parsed: any): any {
    if (!parsed || typeof parsed !== 'object') {
      return parsed;
    }

    if (parsed.content && Array.isArray(parsed.content)) {
      parsed.content = parsed.content.map((block: any) => {
        if (block && typeof block === 'object' &&
          (block.type === 'code' || block.type === 'markdown-code') &&
          typeof block.content === 'string') {

          return {
            ...block,
            content: this.removeMarkdownCodeDelimiters(block.content, block.codeBlockLanguage)
          };
        }
        return block;
      });
    }

    for (const key in parsed) {
      if (parsed.hasOwnProperty(key) && typeof parsed[key] === 'object') {
        parsed[key] = this.cleanupParsedContent(parsed[key]);
      }
    }

    return parsed;
  }

  private extractJsonFromText(text: string): string | null {
    const jsonBlockMatch = text.match(/```json\s*\n([\s\S]*?)\n```/);
    if (jsonBlockMatch) {
      return jsonBlockMatch[1].trim();
    }

    const codeBlockMatch = text.match(/```\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      const content = codeBlockMatch[1].trim();
      if (content.startsWith('{') && content.endsWith('}')) {
        return content;
      }
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    const trimmed = text.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed;
    }

    return null;
  }

  private fixCodeBlockEscaping(jsonString: string): string {
    return jsonString.replace(
      /"content":\s*"([^"]*?)"/g,
      (match, content) => {
        const escaped = content
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/`/g, '\\`')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');

        return `"content": "${escaped}"`;
      }
    );
  }

  private fixQuoteEscaping(jsonString: string): string {
    // Fix unescaped quotes within string values
    return jsonString.replace(
      /"([^"]*?)":\s*"([^"]*?)"/g,
      (match, key, value) => {
        const escapedValue = value.replace(/(?<!\\)"/g, '\\"');
        return `"${key}": "${escapedValue}"`;
      }
    );
  }

  /**
   * Fix newline escaping issues
   */
  private fixNewlineEscaping(jsonString: string): string {
    return jsonString.replace(
      /"content":\s*"([^"]*?)"/g,
      (match, content) => {
        const escaped = content
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r');
        return `"content": "${escaped}"`;
      }
    );
  }

  /**
   * Fix backslash escaping issues
   */
  private fixBackslashEscaping(jsonString: string): string {
    return jsonString.replace(
      /"content":\s*"([^"]*?)"/g,
      (match, content) => {
        // Fix double escaping issues
        const escaped = content.replace(/\\\\/g, '\\');
        return `"content": "${escaped}"`;
      }
    );
  }

  /**
   * Apply comprehensive escaping fixes
   */
  private fixAllEscaping(jsonString: string): string {
    return jsonString.replace(
      /"content":\s*"([\s\S]*?)"/g,
      (match, content) => {
        // Comprehensive content escaping
        const escaped = content
          .replace(/\\/g, '\\\\')    // Escape backslashes
          .replace(/"/g, '\\"')      // Escape quotes
          .replace(/\n/g, '\\n')     // Escape newlines
          .replace(/\r/g, '\\r')     // Escape carriage returns
          .replace(/\t/g, '\\t')     // Escape tabs
          .replace(/`/g, '\\`')      // Escape backticks
          .replace(/\f/g, '\\f')     // Escape form feeds
          .replace(/\b/g, '\\b');    // Escape backspaces

        return `"content": "${escaped}"`;
      }
    );
  }

  /**
   * Parse markdown response and reconstruct schema structure
   * Enhanced to handle more content types and better extraction
   */
  private parseMarkdownToSchema(text: string, structure: ZodObject<any, any, any>): any | null {
    try {
      this.logger.info("Attempting to parse markdown to schema structure");

      // Parse content blocks from markdown structure
      const contentBlocks = this.extractContentBlocks(text);
      const refs = this.extractReferences(text);
      const estimatedTime = this.extractEstimatedTime(text);

      if (contentBlocks.length === 0) {
        this.logger.warn("No content blocks could be extracted from markdown");
        return null;
      }

      const reconstructed = {
        content: contentBlocks,
        refs: refs,
        estimatedTime: estimatedTime || 60 // Default fallback
      };

      // Validate against schema
      const validated = structure.safeParse(reconstructed);
      if (validated.success) {
        this.logger.info("Successfully reconstructed and validated schema from markdown", {
          contentBlocks: contentBlocks.length,
          refs: refs.length,
          estimatedTime
        });
        return validated.data;
      } else {
        this.logger.warn("Reconstructed schema failed validation", { errors: validated.error });
        return null;
      }
    } catch (error) {
      this.logger.error("Error parsing markdown to schema", { error });
      return null;
    }
  }

  /**
   * Enhanced content block extraction with better handling of code blocks
   */
  private extractContentBlocks(text: string): Array<{ type: string, content: string, codeBlockLanguage?: string }> {
    const blocks: Array<{ type: string, content: string, codeBlockLanguage?: string }> = [];

    // Split content while preserving code blocks
    const sections = this.splitContentPreservingCodeBlocks(text);

    for (const section of sections) {
      const trimmed = section.trim();
      if (!trimmed) continue;

      // Check for code blocks with language
      const codeMatch = trimmed.match(/^```(\w+)?\s*\n([\s\S]*?)\n```$/);
      if (codeMatch) {
        const language = codeMatch[1] || 'plaintext';
        const content = codeMatch[2].trim();

        // Determine if this should be 'code' or 'markdown-code' based on context
        blocks.push({
          type: 'code',
          content,
          codeBlockLanguage: language
        });
        continue;
      }

      // Check for file tree (JSON structure)
      if (this.isFileTreeContent(trimmed)) {
        blocks.push({
          type: 'file-tree',
          content: trimmed
        });
        continue;
      }

      // Check for mermaid diagrams
      if (this.isMermaidDiagram(trimmed)) {
        blocks.push({
          type: 'diagram',
          content: trimmed
        });
        continue;
      }

      // Everything else is text content (markdown)
      if (trimmed.length > 10) { // Minimum content length
        blocks.push({
          type: 'text',
          content: trimmed
        });
      }
    }

    // Clean up any remaining markdown delimiters in content
    return this.cleanupContentBlocks(blocks);
  }

  /**
   * Clean up content blocks to remove markdown delimiters from code blocks
   */
  private cleanupContentBlocks(blocks: Array<{ type: string, content: string, codeBlockLanguage?: string }>): Array<{ type: string, content: string, codeBlockLanguage?: string }> {
    return blocks.map(block => {
      // Only clean up code and markdown-code blocks
      if (block.type === 'code' || block.type === 'markdown-code') {
        const cleanedContent = this.removeMarkdownCodeDelimiters(block.content, block.codeBlockLanguage);
        return {
          ...block,
          content: cleanedContent
        };
      }
      return block;
    });
  }

  /**
   * Remove markdown code block delimiters from content
   */
  private removeMarkdownCodeDelimiters(content: string, expectedLanguage?: string): string {
    // Pattern 1: Remove complete code block wrapper ```language\n...content...\n```
    const fullBlockMatch = content.match(/^```(\w+)?\s*\n([\s\S]*?)\n```$/);
    if (fullBlockMatch) {
      const detectedLanguage = fullBlockMatch[1];
      const innerContent = fullBlockMatch[2];

      // If we have an expected language and it doesn't match, log a warning
      if (expectedLanguage && detectedLanguage && detectedLanguage !== expectedLanguage) {
        this.logger.warn("Language mismatch in code block", {
          expected: expectedLanguage,
          detected: detectedLanguage
        });
      }

      return innerContent.trim();
    }

    // Pattern 2: Remove leading ```language and trailing ```
    let cleaned = content;

    // Remove leading code block delimiter
    cleaned = cleaned.replace(/^```\w*\s*\n?/, '');

    // Remove trailing code block delimiter
    cleaned = cleaned.replace(/\n?```\s*$/, '');

    // Remove standalone ``` lines at start or end
    cleaned = cleaned.replace(/^```\s*\n/, '');
    cleaned = cleaned.replace(/\n```\s*$/, '');

    return cleaned.trim();
  }

  /**
   * Split content while preserving code block integrity
   */
  private splitContentPreservingCodeBlocks(text: string): string[] {
    const sections: string[] = [];
    const lines = text.split('\n');
    let currentSection = '';
    let inCodeBlock = false;
    let codeBlockDelimiter = '';

    for (const line of lines) {
      // Check for code block start/end
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          // Starting a code block
          if (currentSection.trim()) {
            sections.push(currentSection);
            currentSection = '';
          }
          inCodeBlock = true;
          codeBlockDelimiter = line.trim();
          currentSection += line + '\n';
        } else if (line.trim() === '```' || line.trim().startsWith('```')) {
          // Ending a code block
          currentSection += line + '\n';
          sections.push(currentSection);
          currentSection = '';
          inCodeBlock = false;
          codeBlockDelimiter = '';
        } else {
          currentSection += line + '\n';
        }
      } else if (inCodeBlock) {
        currentSection += line + '\n';
      } else if (line.trim().startsWith('#') || line.trim() === '---') {
        // Section break
        if (currentSection.trim()) {
          sections.push(currentSection);
          currentSection = '';
        }
        currentSection += line + '\n';
      } else {
        currentSection += line + '\n';
      }
    }

    if (currentSection.trim()) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Check if content represents a file tree structure
   */
  private isFileTreeContent(content: string): boolean {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) && parsed.every(item =>
        item && typeof item === 'object' && 'id' in item && 'name' in item
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if content is a Mermaid diagram
   */
  private isMermaidDiagram(content: string): boolean {
    const mermaidKeywords = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
      'stateDiagram', 'erDiagram', 'gantt', 'pie', 'gitgraph'
    ];

    return mermaidKeywords.some(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Extract references/search queries from markdown
   */
  private extractReferences(text: string): string[] {
    const refs: string[] = [];

    // Look for reference sections
    const refSectionMatch = text.match(/(?:references?|additional.*resources?|further.*reading)[\s\S]*?(?=\n#|\n---|\n\*\*|$)/i);
    if (refSectionMatch) {
      const refSection = refSectionMatch[0];

      // Extract bullet points or numbered lists
      const listItems = refSection.match(/[-*]\s+(.+)/g) || refSection.match(/\d+\.\s+(.+)/g);
      if (listItems) {
        refs.push(...listItems.map(item => item.replace(/^[-*\d\.\s]+/, '').trim()));
      }
    }

    // Fallback: generate default refs based on content
    if (refs.length === 0) {
      // Extract key terms from headers and content
      const headers = text.match(/^#+\s+(.+)$/gm);
      if (headers && headers.length > 0) {
        const mainTopic = headers[0].replace(/^#+\s+/, '');
        refs.push(
          `${mainTopic} official documentation`,
          `${mainTopic} tutorial guide`,
          `${mainTopic} best practices`,
          `${mainTopic} examples and use cases`
        );
      }
    }

    return refs.slice(0, 5); // Limit to 5 refs
  }

  /**
   * Extract estimated time from markdown
   */
  private extractEstimatedTime(text: string): number | null {
    // Look for time estimates in various formats
    const timePatterns = [
      /estimated.*time[:\s]*(\d+)\s*min/i,
      /duration[:\s]*(\d+)\s*min/i,
      /time.*required[:\s]*(\d+)\s*min/i,
      /(\d+)\s*min.*reading/i,
      /takes.*(\d+)\s*min/i
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    // Estimate based on content length (rough approximation)
    const wordCount = text.split(/\s+/).length;
    const readingSpeed = 200; // words per minute
    const estimatedTime = Math.ceil(wordCount / readingSpeed);

    return Math.max(15, Math.min(estimatedTime, 120)); // Between 15-120 minutes
  }

  /**
   * Check if structured parsing failed
   */
  private isParsingFailed(parsed: any): boolean {
    if (parsed === null || parsed === undefined) {
      return true;
    }

    // Check if it's an empty object
    if (typeof parsed === 'object' && Object.keys(parsed).length === 0) {
      return true;
    }

    // Check for common failure patterns
    if (Array.isArray(parsed) && parsed.length === 0) {
      return true;
    }

    return false;
  }

  /**
   * Parse raw response when you already have the raw text
   * Enhanced with both JSON repair and markdown parsing
   */
  async parseRawResponse<T extends ZodObject<any, any, any>>(
    rawText: string,
    structure: T
  ): Promise<z.infer<T> | null> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Parsing raw response text", {
        textLength: rawText.length,
        preview: rawText.substring(0, 100) + "..."
      });

      // Try JSON repair first
      const repairedJson = this.repairAndParseJson(rawText, structure);
      if (repairedJson) {
        return repairedJson;
      }

      // Fallback to markdown parsing
      return this.parseMarkdownToSchema(rawText, structure);
    }, {
      service: "LLMService",
      method: "parseRawResponse"
    });
  }

  private getModel(opts: LLMOpts) {
    switch (opts.provider) {
      case "openai":
        return new ChatOpenAI({
          openAIApiKey: env.OPENAI_API_KEY,
          modelName: opts.model,
          temperature: opts.temperature
        });
      case "gemini":
        return new ChatGoogleGenerativeAI({
          temperature: opts.temperature,
          apiKey: "",
          // uncomment the following line if you want to use gemini
          // apiKey: env.GEMINI_API_KEY,
          model: opts.model
        });
      default:
        throw new Error(`Unsupported provider: ${opts.provider}`);
    }
  }
}

// Export types for external use
export type { LLMResponse };
