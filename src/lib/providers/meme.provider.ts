import env from "@/config/env.config";
import VectorDbService from "../services/vectorDb.service";
import { Logger } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { PromptProvider } from "./prompt.provider";
import { z } from "zod";


interface MemeSearchResult {
  memeId: string;
  name: string;
  url: string;
  width: number;
  height: number;
  boxCount: number;
  description: string;
  searchTerms: string[];
}

interface MemeGenerationRequest {
  template_id: string;
  username: string;
  password: string;
  text0?: string;
  text1?: string;
  boxes?: Array<{
    text: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
    outline_color?: string;
  }>;
}

interface MemeGenerationResponse {
  success: boolean;
  data?: {
    url: string;
    page_url: string;
  };
  error_message?: string;
}

interface AgentMemeDecision {
  selectedMemeId: string;
  reasoning: string;
  useSimpleFormat: boolean;
  text0?: string;
  text1?: string;
  boxes?: Array<{
    text: string;
  }>;
}

interface MemeReview {
  passed: boolean;
  score: number; // 1-10 rating
  issues: string[];
  suggestions: string[];
  feedback: string;
}

// Zod schema for structured meme review output
const MemeReviewSchema = z.object({
  score: z.number().min(1).max(10).describe("Overall meme quality score (1-10)"),
  passed: z.boolean().describe("Whether the meme passes quality standards (score >= 7)"),
  humor_quality: z.number().min(1).max(10).describe("How funny and relatable the meme is (1-10)"),
  template_fit: z.number().min(1).max(10).describe("How well the template matches the intended emotion/situation (1-10)"),
  caption_quality: z.number().min(1).max(10).describe("Quality of text positioning, readability, and impact (1-10)"),
  coherence: z.number().min(1).max(10).describe("Overall coherence and message delivery (1-10)"),
  issues: z.array(z.string()).describe("List of specific problems with the meme"),
  suggestions: z.array(z.string()).describe("Specific improvement recommendations"),
  feedback: z.string().describe("Brief overall assessment and explanation")
});

type MemeReviewStructured = z.infer<typeof MemeReviewSchema>;

// ============================================================================
// MEME PROVIDER IMPLEMENTATION
// ============================================================================

export default class MemeProvider {
  private static instance: MemeProvider | null = null;
  private vectorDbService: VectorDbService;
  private logger: Logger;
  private errorHandler: CentralErrorHandler;
  private llm: ChatOpenAI;
  private qualityAnalyzer: ChatOpenAI;

  private constructor(vectorDbService: VectorDbService, logger: Logger) {
    this.vectorDbService = vectorDbService;
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);

    this.llm = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: "gpt-4.1",
    });

    this.qualityAnalyzer = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: "gpt-4o",
    })
  }

  public static getInstance(logger: Logger, vectorDbService: VectorDbService): MemeProvider {
    if (!this.instance) {
      this.instance = new MemeProvider(vectorDbService, logger);
    }
    return this.instance;
  }

  // ============================================================================
  // MAIN MEME GENERATION METHOD - ENHANCED AGENT APPROACH
  // ============================================================================

  public async generateMeme(query: string): Promise<string> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Starting enhanced agent-based meme generation", { query });

      let attempts = 0;
      const maxAttempts = 3;
      let lastError: Error | null = null;

      while (attempts < maxAttempts) {
        attempts++;

        try {
          this.logger.info(`Enhanced agent attempt ${attempts}/${maxAttempts}`, { query });

          // Create enhanced agent with feedback tools
          const agent = await this.createEnhancedMemeAgent();

          // Execute agent with query - increased iterations for feedback loop
          const result = await agent.invoke({
            input: query,
            chat_history: [],
          });

          // Extract meme URL from result
          const memeUrl = this.extractMemeUrl(result.output);

          if (!memeUrl) {
            throw new Error("Agent did not return a valid meme URL");
          }

          this.logger.info("Enhanced agent generated meme successfully", {
            query,
            attempts,
            memeUrl
          });

          return memeUrl;

        } catch (error) {
          lastError = error as Error;
          this.logger.warn(`Enhanced agent attempt ${attempts} failed`, {
            query,
            error: lastError.message
          });

          if (attempts < maxAttempts) {
            // Modify query for retry
            query = this.generateRetryQuery(query, attempts);
            this.logger.info(`Retrying with modified query`, { newQuery: query });
          }
        }
      }

      // All attempts failed
      this.logger.error("All enhanced agent attempts failed", {
        originalQuery: query,
        attempts: maxAttempts,
        lastError: lastError?.message
      });

      throw new Error(`Failed to generate meme after ${maxAttempts} attempts: ${lastError?.message}`);

    }, {
      service: "MemeProvider",
      method: "generateMeme"
    });
  }

  // ============================================================================
  // ENHANCED AGENT CREATION & TOOL SETUP
  // ============================================================================

  private async createEnhancedMemeAgent(): Promise<AgentExecutor> {
    const tools = [
      this.createMemeFinderTool(),
      this.createMemeCreatorTool(),
      this.createMemeReviewTool() // New feedback tool
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", this.getEnhancedAgentSystemPrompt()],
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const agent = createToolCallingAgent({
      llm: this.llm,
      tools,
      prompt,
    });

    return new AgentExecutor({
      agent,
      tools,
      maxIterations: 12, // Increased for feedback loop (4 per cycle * 3 potential cycles)
      verbose: false,
      returnIntermediateSteps: false,
    });
  }

  private createMemeFinderTool(): DynamicTool {
    return new DynamicTool({
      name: "memeFinder",
      description: "Search for relevant meme templates using search terms. Returns top 5 matching memes with their details.",
      func: async (input: string) => {
        try {
          const searchTerms = input.trim();
          this.logger.info("Agent using memeFinder tool", { searchTerms });

          const memes = await this.searchMemeTemplates(searchTerms);

          const formattedResults = memes.map(meme => ({
            id: meme.memeId,
            name: meme.name,
            description: meme.description,
            boxCount: meme.boxCount,
            searchTerms: meme.searchTerms,
            format: meme.boxCount <= 2 ? 'simple' : 'complex'
          }));

          return JSON.stringify(formattedResults);

        } catch (error) {
          this.logger.error("memeFinder tool failed", { error, input });
          return JSON.stringify({ error: `Failed to search memes: ${error.message}` });
        }
      },
    });
  }

  private createMemeCreatorTool(): DynamicTool {
    return new DynamicTool({
      name: "createMeme",
      description: "Create a meme using Imgflip API. Input should be JSON with memeId, useSimpleFormat, and text fields.",
      func: async (input: string) => {
        try {
          const memeData = JSON.parse(input);
          this.logger.info("Agent using createMeme tool", { memeData });

          if (!memeData.memeId) {
            throw new Error("memeId is required");
          }

          const decision: AgentMemeDecision = {
            selectedMemeId: memeData.memeId,
            reasoning: memeData.reasoning || "Agent selected this template",
            useSimpleFormat: memeData.useSimpleFormat !== false,
            text0: memeData.text0,
            text1: memeData.text1,
            boxes: memeData.boxes
          };

          const memeUrl = await this.createMemeViaImgflip(decision);

          return JSON.stringify({
            success: true,
            url: memeUrl,
            message: "Meme created successfully! Use reviewMeme tool to evaluate quality."
          });

        } catch (error) {
          this.logger.error("createMeme tool failed", { error, input });
          return JSON.stringify({
            success: false,
            error: `Failed to create meme: ${error.message}`
          });
        }
      },
    });
  }

  private createMemeReviewTool(): DynamicTool {
    return new DynamicTool({
      name: "reviewMeme",
      description: "Review a generated meme for quality, humor, template fit, and caption correctness. Input should be the meme URL.",
      func: async (input: string) => {
        try {
          const memeUrl = input.trim();
          this.logger.info("Agent using reviewMeme tool", { memeUrl });

          const review = await this.reviewMemeQuality(memeUrl);

          return JSON.stringify({
            passed: review.passed,
            score: review.score,
            issues: review.issues,
            suggestions: review.suggestions,
            feedback: review.feedback,
            decision: review.passed ?
              "Meme quality is good! Return this URL to user." :
              "Meme needs improvement. Use suggestions to create a better version."
          });

        } catch (error) {
          this.logger.error("reviewMeme tool failed", { error, input });
          return JSON.stringify({
            passed: false,
            score: 0,
            issues: [`Review failed: ${error.message}`],
            suggestions: ["Try creating the meme again with different template or text"],
            feedback: "Could not evaluate meme quality due to technical error"
          });
        }
      },
    });
  }

  private getEnhancedAgentSystemPrompt(): string {
    return `${PromptProvider.getMemeGenerationPrompt()}

`;
  }


  private async reviewMemeQuality(memeUrl: string): Promise<MemeReview> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Reviewing meme quality", { memeUrl });

      const systemPrompt = `You are an expert meme quality analyst specializing in programming/developer memes. Analyze meme images comprehensively, paying special attention to both simple and complex formats.

EVALUATION CRITERIA:

## Core Quality Dimensions (40% of score)
1. **Humor Quality** (10%): Is it genuinely funny, relatable, and engaging for developers?
2. **Template Appropriateness** (10%): Does the meme template match the intended emotion/situation?
3. **Caption Quality** (10%): Are texts readable, well-positioned, grammatically correct, and punchy?
4. **Overall Coherence** (10%): Does the meme make complete sense and deliver its intended message?

## Enhanced Analysis Dimensions (60% of score)
5. **Narrative Flow** (15%): For multi-panel memes, does the story progress logically and build to a satisfying conclusion?
6. **Cultural Context** (15%): Does it properly use established meme format conventions and developer culture references?
7. **Developer Authenticity** (15%): How authentic and relatable is the developer experience portrayed?
8. **Format Execution** (15%): How well does it execute the chosen meme format (simple vs complex narrative)?

## Format Recognition
**Simple Memes**: 1-2 text boxes, direct punchline (Drake pointing, Success Kid, etc.)
**Complex Narrative**: Multi-panel story progression (Scroll of Truth, Brain expanding, etc.)  
**Multi-Panel**: 3+ panels showing progression or comparison
**Single Panel**: Complex image with multiple text elements

## Scoring Guidelines:
- **9-10**: Exceptional - would go viral in developer communities
- **7-8**: Good - funny and well-executed, passes quality standards
- **5-6**: Decent - has potential but notable issues  
- **3-4**: Poor - major problems with execution or humor
- **1-2**: Fails - not funny, incoherent, or misuses format

## Special Considerations for Complex Memes:
- **Story Arc**: Does each panel build on the previous one?
- **Text Placement**: Is text readable across all panels?
- **Pacing**: Does the narrative flow at appropriate speed?
- **Payoff**: Is the final panel/punchline worth the buildup?
- **Format Mastery**: Does it use the template's established pattern correctly?

## Developer Experience Authenticity:
- **Real Pain Points**: Captures actual developer frustrations/victories
- **Technical Accuracy**: References are correct (even if exaggerated)
- **Community Language**: Uses authentic developer terminology and mindset
- **Emotional Resonance**: Evokes genuine "this is so me" reactions

Analyze the meme objectively, provide detailed feedback, and give specific improvement suggestions for both simple and complex formats.`;

      const humanPrompt = `Please analyze this meme image for quality and humor effectiveness.`;

      try {
        const reviewData = await this.qualityAnalyzer.withStructuredOutput({
          schema: MemeReviewSchema,
          name: "meme_quality_review"
        }).invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage({
            content: [
              {
                type: "text",
                text: humanPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: memeUrl
                }
              }
            ]
          })
        ]) as MemeReviewStructured;

        const review: MemeReview = {
          passed: reviewData.passed || reviewData.score >= 7,
          score: reviewData.score || 0,
          issues: reviewData.issues || [],
          suggestions: reviewData.suggestions || [],
          feedback: reviewData.feedback || "Review completed"
        };

        this.logger.info("Meme review completed", {
          memeUrl,
          score: review.score,
          passed: review.passed,
          issueCount: review.issues.length,
          detailedScores: {
            humor: reviewData.humor_quality,
            template: reviewData.template_fit,
            caption: reviewData.caption_quality,
            coherence: reviewData.coherence
          }
        });

        return review;

      } catch (error) {
        this.logger.error("Quality analyzer failed", { error: error.message, memeUrl });

        // Fallback review
        return {
          passed: false,
          score: 5,
          issues: ["Could not properly analyze meme quality"],
          suggestions: ["Try a different template or improve caption text"],
          feedback: "Technical review failure - manual evaluation recommended"
        };
      }

    }, {
      service: "MemeProvider",
      method: "reviewMemeQuality"
    });
  }

  // ============================================================================
  // CORE FUNCTIONALITY - EXISTING METHODS (UNCHANGED)
  // ============================================================================

  private async searchMemeTemplates(query: string): Promise<MemeSearchResult[]> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Searching for relevant memes", { query });

      const searchResults = await this.vectorDbService.topK(query, 5, {
        index: env.MEME_PINECONE_INDEX,
        model: env.DEFAULT_EMBEDDING_MODEL,
        includeMetadata: true,
      });

      const memes: MemeSearchResult[] = searchResults
        .filter(match => match.metadata)
        .map(match => ({
          memeId: match.metadata!.memeId as string,
          name: match.metadata!.name as string,
          url: match.metadata!.url as string,
          width: match.metadata!.width as number,
          height: match.metadata!.height as number,
          boxCount: match.metadata!.boxCount as number,
          description: match.metadata!.description as string,
          searchTerms: match.metadata!.searchTerms as string[] || [],
        }));

      this.logger.info("Found relevant memes", {
        query,
        memeCount: memes.length,
        memeNames: memes.map(m => m.name)
      });

      return memes;

    }, {
      service: "MemeProvider",
      method: "searchMemeTemplates"
    });
  }

  private async createMemeViaImgflip(decision: AgentMemeDecision): Promise<string> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Creating meme via Imgflip API", {
        memeId: decision.selectedMemeId,
        useSimpleFormat: decision.useSimpleFormat
      });

      const requestBody: MemeGenerationRequest = {
        template_id: decision.selectedMemeId,
        username: env.IMGFLIP_USERNAME,
        password: env.IMGFLIP_PASSWORD,
      };

      if (decision.useSimpleFormat) {
        requestBody.text0 = decision.text0 || "";
        requestBody.text1 = decision.text1 || "";
      } else {
        requestBody.boxes = decision.boxes || [];
      }

      // Convert to form data
      const formData = new URLSearchParams();
      formData.append('template_id', requestBody.template_id);
      formData.append('username', requestBody.username);
      formData.append('password', requestBody.password);

      if (requestBody.text0 !== undefined) {
        formData.append('text0', requestBody.text0);
      }
      if (requestBody.text1 !== undefined) {
        formData.append('text1', requestBody.text1);
      }
      if (requestBody.boxes) {
        requestBody.boxes.forEach((box, index) => {
          formData.append(`boxes[${index}][text]`, box.text);
          if (box.x !== undefined) formData.append(`boxes[${index}][x]`, box.x.toString());
          if (box.y !== undefined) formData.append(`boxes[${index}][y]`, box.y.toString());
          if (box.width !== undefined) formData.append(`boxes[${index}][width]`, box.width.toString());
          if (box.height !== undefined) formData.append(`boxes[${index}][height]`, box.height.toString());
          if (box.color) formData.append(`boxes[${index}][color]`, box.color);
          if (box.outline_color) formData.append(`boxes[${index}][outline_color]`, box.outline_color);
        });
      }

      const response = await fetch('https://api.imgflip.com/caption_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`Imgflip API request failed: ${response.status} ${response.statusText}`);
      }

      const result: MemeGenerationResponse = await response.json();

      if (!result.success) {
        throw new Error(`Imgflip API error: ${result.error_message}`);
      }

      if (!result.data?.url) {
        throw new Error("Imgflip API returned no meme URL");
      }

      this.logger.info("Meme created successfully", {
        memeUrl: result.data.url,
        pageUrl: result.data.page_url
      });

      return result.data.url;

    }, {
      service: "MemeProvider",
      method: "createMemeViaImgflip"
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private extractMemeUrl(agentOutput: string): string | null {
    try {
      // Try to extract URL from agent output
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = agentOutput.match(urlRegex);

      if (urls) {
        // Return the first imgflip URL found
        const imgflipUrl = urls.find(url => url.includes('imgflip.com'));
        return imgflipUrl || urls[0];
      }

      // If no URL found, try to parse as JSON
      const jsonMatch = agentOutput.match(/\{[^}]*"url"[^}]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.url;
      }

      return null;
    } catch (error) {
      this.logger.warn("Failed to extract meme URL from agent output", {
        output: agentOutput,
        error: error.message
      });
      return null;
    }
  }

  private generateRetryQuery(originalQuery: string, attemptNumber: number): string {
    const variations = [
      `${originalQuery} meme`,
      `funny ${originalQuery}`,
      `${originalQuery} humor`,
      `${originalQuery} joke`,
      `relatable ${originalQuery}`,
    ];

    const variationIndex = (attemptNumber - 1) % variations.length;
    return variations[variationIndex];
  }

  // ============================================================================
  // PUBLIC UTILITY METHODS
  // ============================================================================

  public async getStatus(): Promise<{
    available: boolean;
    memesIndexed: number;
    ready: boolean;
    enhancedFeatures: boolean;
  }> {
    try {
      // Test search to check if memes are available
      const testResult = await this.searchMemeTemplates("test");

      return {
        available: true,
        memesIndexed: testResult.length,
        ready: testResult.length > 0,
        enhancedFeatures: true, // Indicates feedback loop is active
      };
    } catch (error) {
      this.logger.error("Enhanced MemeProvider status check failed", { error });
      return {
        available: false,
        memesIndexed: 0,
        ready: false,
        enhancedFeatures: false,
      };
    }
  }

  // Backward compatibility method
  public async memeFinder(query: string): Promise<MemeSearchResult[]> {
    return this.searchMemeTemplates(query);
  }
}
