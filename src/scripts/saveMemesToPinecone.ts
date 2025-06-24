// import { getDefaultLLMService, getDefaultLogger, getDefaultVectorDbService } from "@/config/defaults";
// import { z } from "zod";
// import { v4 } from "uuid";
// import env from "@/config/env.config";
//
// const logger = getDefaultLogger();
//
// // ============================================================================
// // CONFIGURATION & INTERFACES
// // ============================================================================
//
// const CONFIG = {
//   // Processing settings
//   BATCH_SIZE: 10, // Process 10 memes at a time for LLM enhancement
//   PINECONE_BATCH_SIZE: 25, // Reduced from 50 to avoid rate limits
//
//   // Timeout and retry settings
//   LLM_TIMEOUT_MS: 30000, // 30 second timeout
//   MAX_RETRIES: 3,
//   BASE_DELAY_MS: 1000, // 1 second base delay
//   PINECONE_DELAY_MS: 2000, // 2 second delay between Pinecone batches
//
//   // API settings
//   IMGFLIP_API_URL: "https://api.imgflip.com/get_memes"
// };
//
// interface MemeData {
//   id: string;
//   name: string;
//   url: string;
//   width: number;
//   height: number;
//   box_count: number;
// }
//
// interface EnhancedMeme extends MemeData {
//   enhancedSearchText: string;
//   searchTerms: string[];
//   description: string;
// }
//
// interface ProcessingStats {
//   totalFetched: number;
//   totalEnhanced: number;
//   totalSaved: number;
//   processingTimeMs: number;
// }
//
// // ============================================================================
// // UTILITY FUNCTIONS
// // ============================================================================
//
// async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
//   const timeoutPromise = new Promise<never>((_, reject) => {
//     setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
//   });
//
//   return Promise.race([promise, timeoutPromise]);
// }
//
// async function retryWithExponentialBackoff<T>(
//   operation: () => Promise<T>,
//   maxAttempts: number = CONFIG.MAX_RETRIES,
//   baseDelayMs: number = CONFIG.BASE_DELAY_MS
// ): Promise<T> {
//   let lastError: Error;
//
//   for (let attempt = 1; attempt <= maxAttempts; attempt++) {
//     try {
//       return await operation();
//     } catch (error) {
//       lastError = error as Error;
//       logger.warn(`Attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
//
//       if (attempt < maxAttempts) {
//         const delay = baseDelayMs * Math.pow(2, attempt - 1);
//         logger.info(`Retrying in ${delay}ms...`);
//         await new Promise(resolve => setTimeout(resolve, delay));
//       }
//     }
//   }
//
//   throw lastError;
// }
//
// // ============================================================================
// // STAGE 1: FETCH MEMES FROM IMGFLIP API
// // ============================================================================
//
// async function fetchMemesFromImgflip(): Promise<MemeData[]> {
//   logger.info("🔍 Fetching memes from Imgflip API...");
//
//   try {
//     const response = await fetch(CONFIG.IMGFLIP_API_URL);
//
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//
//     const data = await response.json();
//
//     if (!data.success) {
//       throw new Error("Imgflip API returned success: false");
//     }
//
//     const memes: MemeData[] = data.data.memes.map((meme: any) => ({
//       id: meme.id,
//       name: meme.name,
//       url: meme.url,
//       width: meme.width,
//       height: meme.height,
//       box_count: meme.box_count
//     }));
//
//     logger.info(`✅ Successfully fetched ${memes.length} memes from Imgflip`);
//     return memes;
//
//   } catch (error) {
//     logger.error("❌ Error fetching memes from Imgflip:", error);
//     throw error;
//   }
// }
//
// // ============================================================================
// // STAGE 2: ENHANCE MEME NAMES FOR BETTER SEARCH
// // ============================================================================
//
// async function enhanceMemeBatch(memeBatch: MemeData[], batchIndex: number): Promise<EnhancedMeme[]> {
//   logger.info(`🚀 Enhancing batch ${batchIndex + 1} (${memeBatch.length} memes)`);
//
//   const prompt = `You are enhancing meme names for better search functionality in a meme platform.
//
// Your task: Generate enhanced search metadata for popular internet memes to improve discoverability.
//
// For each meme, provide:
// 1. **Enhanced search text**: A comprehensive description including the meme name, common variations, cultural context, and usage scenarios
// 2. **Search terms**: Array of keywords people might use to search for this meme
// 3. **Description**: Brief explanation of what the meme represents or is used for
//
// EXAMPLES:
// - "Distracted Boyfriend" → search terms: ["distracted", "boyfriend", "girlfriend", "cheating", "looking", "choice", "decision", "temptation"]
// - "Drake Pointing" → search terms: ["drake", "pointing", "approve", "disapprove", "yes", "no", "preference", "choice", "like", "dislike"]
// - "Woman Yelling at Cat" → search terms: ["woman", "yelling", "cat", "table", "dinner", "angry", "confused", "argument", "pointing"]
//
// Focus on:
// - Common alternative names for the meme
// - Emotions or situations the meme represents
// - Popular usage contexts
// - Visual elements people might remember
// - Cultural references or origins
//
// Memes to enhance:
// ${memeBatch.map(meme => `${meme.name} (ID: ${meme.id})`).join('\n')}
//
// Generate comprehensive search metadata:`;
//
//   const schema = z.object({
//     memes: z.array(z.object({
//       id: z.string().describe("exact meme ID from input"),
//       name: z.string().describe("original meme name"),
//       enhancedSearchText: z.string().describe("comprehensive searchable description"),
//       searchTerms: z.array(z.string()).max(15).describe("keywords for search"),
//       description: z.string().max(200).describe("brief explanation of the meme")
//     }))
//   });
//
//   const operation = async () => {
//     const llmService = getDefaultLLMService();
//     return await withTimeout(
//       llmService.structuredResponse(prompt, schema, {
//         model: "gpt-4o-mini",
//         provider: "openai",
//         temperature: 0.3,
//       }),
//       CONFIG.LLM_TIMEOUT_MS
//     );
//   };
//
//   try {
//     const result = await retryWithExponentialBackoff(operation);
//
//     const enhancedMemes: EnhancedMeme[] = memeBatch.map(meme => {
//       const enhanced = result?.parsed.memes.find(r => r.id === meme.id);
//       return {
//         ...meme,
//         enhancedSearchText: enhanced?.enhancedSearchText || meme.name,
//         searchTerms: enhanced?.searchTerms || [meme.name.toLowerCase()],
//         description: enhanced?.description || `Popular meme: ${meme.name}`
//       };
//     });
//
//     logger.info(`✅ Batch ${batchIndex + 1}: Enhanced ${enhancedMemes.length}/${memeBatch.length} memes`);
//     return enhancedMemes;
//
//   } catch (error) {
//     logger.error(`❌ Error enhancing batch ${batchIndex + 1}:`, error);
//
//     // Fallback: return memes with basic enhancement
//     return memeBatch.map(meme => ({
//       ...meme,
//       enhancedSearchText: meme.name,
//       searchTerms: [meme.name.toLowerCase()],
//       description: `Popular meme: ${meme.name}`
//     }));
//   }
// }
//
// // ============================================================================
// // STAGE 3: BATCH PROCESSING FOR ENHANCEMENT
// // ============================================================================
//
// async function runBatchEnhancement(memes: MemeData[]): Promise<EnhancedMeme[]> {
//   const batches: MemeData[][] = [];
//   for (let i = 0; i < memes.length; i += CONFIG.BATCH_SIZE) {
//     batches.push(memes.slice(i, i + CONFIG.BATCH_SIZE));
//   }
//
//   logger.info(`📊 Processing ${batches.length} batches for enhancement`);
//   const results: EnhancedMeme[] = [];
//
//   for (let i = 0; i < batches.length; i++) {
//     const batch = batches[i];
//     logger.info(`Processing batch ${i + 1}/${batches.length}`);
//
//     try {
//       const enhancedBatch = await enhanceMemeBatch(batch, i);
//       results.push(...enhancedBatch);
//
//       logger.info(`⏳ Progress: ${results.length}/${memes.length} memes enhanced`);
//
//       // Add small delay between batches to be gentle on the API
//       if (i + 1 < batches.length) {
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
//
//     } catch (error) {
//       logger.error(`Batch ${i + 1} failed completely:`, error);
//       // Add unenhanced memes as fallback
//       results.push(...batch.map(meme => ({
//         ...meme,
//         enhancedSearchText: meme.name,
//         searchTerms: [meme.name.toLowerCase()],
//         description: `Popular meme: ${meme.name}`
//       })));
//     }
//   }
//
//   return results;
// }
//
// // ============================================================================
// // STAGE 4: CREATE OPTIMIZED EMBEDDINGS AND SAVE TO PINECONE
// // ============================================================================
//
// function createMemeEmbeddingText(meme: EnhancedMeme): string {
//   const components = [
//     // Meme name (multiple times for importance)
//     meme.name,
//     meme.name,
//     meme.name,
//
//     // Enhanced search text
//     meme.enhancedSearchText,
//
//     // All search terms
//     ...meme.searchTerms,
//
//     // Description
//     meme.description,
//
//     // Additional variations of the name
//     meme.name.toLowerCase(),
//     meme.name.replace(/\s+/g, ''),
//     meme.name.replace(/\s+/g, '_'),
//   ];
//
//   return components.join(' ').toLowerCase();
// }
//
// async function saveMemesBatch(memes: EnhancedMeme[]): Promise<number> {
//   logger.info(`💾 Saving ${memes.length} memes to Pinecone`);
//
//   const vectorDbService = getDefaultVectorDbService();
//
//   const vectorData = memes.map(meme => ({
//     id: v4(),
//     data: createMemeEmbeddingText(meme),
//     metadata: {
//       // Core meme data
//       memeId: meme.id,
//       name: meme.name,
//       url: meme.url,
//       width: meme.width,
//       height: meme.height,
//       boxCount: meme.box_count,
//
//       // Enhanced search data
//       description: meme.description,
//       searchTerms: meme.searchTerms,
//       enhancedSearchText: meme.enhancedSearchText,
//
//       // Additional useful info
//       aspectRatio: (meme.width / meme.height).toFixed(2),
//       isSquare: Math.abs(meme.width - meme.height) < 50,
//       isWide: meme.width > meme.height * 1.5,
//       isTall: meme.height > meme.width * 1.5,
//     }
//   }));
//
//   let savedCount = 0;
//   for (let i = 0; i < vectorData.length; i += CONFIG.PINECONE_BATCH_SIZE) {
//     const batch = vectorData.slice(i, i + CONFIG.PINECONE_BATCH_SIZE);
//     const batchNum = Math.floor(i / CONFIG.PINECONE_BATCH_SIZE) + 1;
//     const totalBatches = Math.ceil(vectorData.length / CONFIG.PINECONE_BATCH_SIZE);
//
//     try {
//       await vectorDbService.saveMultiple(batch, {
//         model: env.DEFAULT_EMBEDDING_MODEL,
//         index: env.MEME_PINECONE_INDEX
//       });
//
//       savedCount += batch.length;
//       logger.info(`📊 Progress: ${savedCount}/${vectorData.length} memes saved (batch ${batchNum}/${totalBatches})`);
//
//       // Rate limiting - increased delay
//       if (i + CONFIG.PINECONE_BATCH_SIZE < vectorData.length) {
//         await new Promise(resolve => setTimeout(resolve, CONFIG.PINECONE_DELAY_MS));
//       }
//
//     } catch (error) {
//       logger.error(`❌ Error saving batch ${batchNum}:`, error);
//       logger.error(`❌ Batch details: ${batch.length} items, first item ID: ${batch[0]?.id}`);
//       // You could add retry logic here or skip this batch
//     }
//   }
//
//   logger.info(`✅ Successfully saved ${savedCount} memes to Pinecone`);
//   return savedCount;
// }
//
// // ============================================================================
// // MAIN PROCESSING PIPELINE
// // ============================================================================
//
// export async function processMemeEmbeddings(): Promise<ProcessingStats> {
//   const startTime = Date.now();
//   logger.info("🚀 Starting Meme Embeddings Processing");
//
//   try {
//     // Stage 1: Fetch memes from Imgflip
//     const memes = await fetchMemesFromImgflip();
//
//     // Stage 2: Enhance meme names for better search
//     const enhancedMemes = await runBatchEnhancement(memes);
//
//     // Stage 3: Save to Pinecone
//     const savedCount = await saveMemesBatch(enhancedMemes);
//
//     const processingTime = Date.now() - startTime;
//     const stats: ProcessingStats = {
//       totalFetched: memes.length,
//       totalEnhanced: enhancedMemes.length,
//       totalSaved: savedCount,
//       processingTimeMs: processingTime
//     };
//
//     // Print final statistics
//     logger.info("\n" + "=".repeat(60));
//     logger.info("🎉 MEME PROCESSING COMPLETE");
//     logger.info("=".repeat(60));
//     logger.info(`⏱️  Total Time: ${(processingTime / 1000).toFixed(1)}s`);
//     logger.info(`📥 Memes Fetched: ${stats.totalFetched}`);
//     logger.info(`✨ Memes Enhanced: ${stats.totalEnhanced}`);
//     logger.info(`💾 Memes Saved: ${stats.totalSaved}`);
//     logger.info(`🚀 Processing Rate: ${(stats.totalFetched / (processingTime / 1000)).toFixed(1)} memes/sec`);
//     logger.info(`💰 Estimated Cost: ~$${(stats.totalEnhanced * 0.001).toFixed(3)}`);
//
//     return stats;
//
//   } catch (error) {
//     logger.error("❌ Meme processing failed:", error);
//     throw error;
//   }
// }
//
// // ============================================================================
// // EXECUTION
// // ============================================================================
//
// if (require.main === module) {
//   logger.info("🚀 Starting meme processing script...");
//
//   processMemeEmbeddings()
//     .then((stats) => {
//       logger.info("\n✅ Meme processing completed successfully!");
//       logger.info(`📊 Final results: ${stats.totalSaved} memes saved from ${stats.totalFetched} fetched`);
//       process.exit(0);
//     })
//     .catch((error) => {
//       logger.error("\n❌ Meme processing failed:");
//       logger.error("Error message:", error.message);
//
//       // Helpful debugging for common issues
//       if (error.message.includes("timeout")) {
//         logger.error("💡 Try increasing LLM_TIMEOUT_MS");
//       }
//       if (error.message.includes("rate limit") || error.message.includes("429")) {
//         logger.error("💡 Rate limit hit - increase delays between batches");
//       }
//       if (error.message.includes("fetch")) {
//         logger.error("💡 Check network connection and Imgflip API availability");
//       }
//
//       logger.error("Full error:", error);
//       process.exit(1);
//     });
// }
