import env from "@/config/env.config";
import VectorDbService from "../services/vectorDb.service";
import { Logger } from "@/types";
import { CentralErrorHandler } from "../errorHandler/centralErrorHandler";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { PromptProvider } from "./prompt.provider";

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

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

// ============================================================================
// MEME PROVIDER IMPLEMENTATION
// ============================================================================

export default class MemeProvider {
  private static instance: MemeProvider | null = null;
  private vectorDbService: VectorDbService;
  private logger: Logger;
  private errorHandler: CentralErrorHandler;
  private llm: ChatOpenAI;

  private constructor(vectorDbService: VectorDbService, logger: Logger) {
    this.vectorDbService = vectorDbService;
    this.logger = logger;
    this.errorHandler = new CentralErrorHandler(logger);

    // Initialize o3-mini model
    this.llm = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: "gpt-4.1",
    });
  }

  public static getInstance(logger: Logger, vectorDbService: VectorDbService): MemeProvider {
    if (!this.instance) {
      this.instance = new MemeProvider(vectorDbService, logger);
    }
    return this.instance;
  }

  // ============================================================================
  // MAIN MEME GENERATION METHOD - AGENT APPROACH
  // ============================================================================

  public async generateMeme(query: string): Promise<string> {
    return this.errorHandler.handleError(async () => {
      this.logger.info("Starting agent-based meme generation", { query });

      let attempts = 0;
      const maxAttempts = 3;
      let lastError: Error | null = null;

      while (attempts < maxAttempts) {
        attempts++;

        try {
          this.logger.info(`Agent attempt ${attempts}/${maxAttempts}`, { query });

          // Create agent with tools
          const agent = await this.createMemeAgent();

          // Execute agent with query
          const result = await agent.invoke({
            input: query,
            chat_history: [],
          });

          // Extract meme URL from result
          const memeUrl = this.extractMemeUrl(result.output);

          if (!memeUrl) {
            throw new Error("Agent did not return a valid meme URL");
          }

          this.logger.info("Agent generated meme successfully", {
            query,
            attempts,
            memeUrl
          });

          return memeUrl;

        } catch (error) {
          lastError = error as Error;
          this.logger.warn(`Agent attempt ${attempts} failed`, {
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
      this.logger.error("All agent attempts failed", {
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
  // AGENT CREATION & TOOL SETUP
  // ============================================================================

  private async createMemeAgent(): Promise<AgentExecutor> {
    const tools = [
      this.createMemeFinderTool(),
      this.createMemeCreatorTool()
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", this.getAgentSystemPrompt()],
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
      maxIterations: 5,
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
          // Parse input - expecting search terms
          const searchTerms = input.trim();

          this.logger.info("Agent using memeFinder tool", { searchTerms });

          const memes = await this.searchMemeTemplates(searchTerms);

          // Return formatted results for agent
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
          // Parse the agent's input
          const memeData = JSON.parse(input);

          this.logger.info("Agent using createMeme tool", { memeData });

          // Validate required fields
          if (!memeData.memeId) {
            throw new Error("memeId is required");
          }

          // Convert to our decision format
          const decision: AgentMemeDecision = {
            selectedMemeId: memeData.memeId,
            reasoning: memeData.reasoning || "Agent selected this template",
            useSimpleFormat: memeData.useSimpleFormat !== false, // Default to true
            text0: memeData.text0,
            text1: memeData.text1,
            boxes: memeData.boxes
          };

          const memeUrl = await this.createMemeViaImgflip(decision);

          return JSON.stringify({
            success: true,
            url: memeUrl,
            message: "Meme created successfully!"
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

  private getAgentSystemPrompt(): string {
    return `${PromptProvider.getMemeGenerationPrompt()}



Remember: HUMOR FIRST! Make it funny, not explanatory. Capture the emotional experience, not just the technical details.

Always end your response with the meme URL when successful.`;
  }

  // ============================================================================
  // CORE FUNCTIONALITY - TOOLS IMPLEMENTATION
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
      // Look for URLs in the response
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
  }> {
    try {
      // Test search to check if memes are available
      const testResult = await this.searchMemeTemplates("test");

      return {
        available: true,
        memesIndexed: testResult.length,
        ready: testResult.length > 0,
      };
    } catch (error) {
      this.logger.error("MemeProvider status check failed", { error });
      return {
        available: false,
        memesIndexed: 0,
        ready: false,
      };
    }
  }

  // Backward compatibility method
  public async memeFinder(query: string): Promise<MemeSearchResult[]> {
    return this.searchMemeTemplates(query);
  }
}
