// import { getDefaultLLMService, getDefaultLogger, getDefaultVectorDbService } from "@/config/defaults";
// import icons from "@/lib/providers/icons.list.provider";
// import { z } from "zod";
// import { v4 } from "uuid";
// import env from "@/config/env.config";
// const logger = getDefaultLogger()
//
// // ============================================================================
// // CONFIGURATION & INTERFACES
// // ============================================================================
//
// const CONFIG = {
//   // Processing performance - reduced for stability
//   CONCURRENT_BATCHES: 15, // Reduced from 45 for tier 4 stability
//   STAGE1_BATCH_SIZE: 8,   // Reduced batch sizes
//   STAGE2_BATCH_SIZE: 6,
//   STAGE3_BATCH_SIZE: 5,
//   PINECONE_BATCH_SIZE: 200,
//
//   // Timeout and retry settings
//   LLM_TIMEOUT_MS: 60000,  // 60 second timeout
//   MAX_RETRIES: 3,
//   BASE_DELAY_MS: 2000,    // 2 second base delay
//   BATCH_DELAY_MS: 1500,   // Delay between concurrent batch groups
//
//   // Quality thresholds
//   MIN_EDUCATIONAL_SCORE: 6,
//   MIN_SEARCH_ACCURACY: 5,
//   MAX_FINAL_ICONS: 1200,
//   TARGET_RETENTION_RATE: 0.12,
//
//   // Search optimization
//   COURSE_WEIGHT_MULTIPLIER: 3,
//   MODULE_WEIGHT_MULTIPLIER: 3,
//   CONCEPT_WEIGHT_MULTIPLIER: 2
// };
//
// interface ProcessedIcon {
//   iconName: string;
//   code: string;
//   educationalScore: number;
//   searchAccuracy: number;
//   visualClarity: "excellent" | "good" | "poor";
//   recognizability: "immediate" | "context-needed" | "obscure";
//   primaryConcept: string;
//   courseTerms: string[];
//   moduleTerms: string[];
//   visualTerms: string[];
//   educationalContexts: string[];
// }
//
// interface ProcessingStats {
//   stage1Filtered: number;
//   stage2Scored: number;
//   stage3Enhanced: number;
//   stage4Validated: number;
//   stage5Deduplicated: number;
//   finalSaved: number;
//   avgEducationalScore: number;
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
//         const delay = baseDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
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
// // STAGE 1: INTELLIGENT PRE-FILTERING
// // ============================================================================
//
// function stage1PreFilter(allIcons: { name: string, code: string }[]): { name: string, code: string }[] {
//   logger.info(`🔍 Stage 1: Pre-filtering ${allIcons.length} icons`);
//
//   const filtered = allIcons.filter(icon => {
//     // Remove deprecated/old icons
//     if (/old|deprecated|legacy|archive/.test(icon.name)) return false;
//
//     // Keep only educational-relevant prefixes
//     const goodPrefixes = [
//       'nf-dev-', 'nf-seti-', 'nf-mdi-', 'nf-fa-', 'nf-oct-',
//       'nf-linux-', 'nf-cod-', 'nf-md-', 'nf-simple-', 'nf-custom-',
//       'nf-weather-', 'nf-file-', 'nf-fae-'
//     ];
//
//     if (!goodPrefixes.some(prefix => icon.name.startsWith(prefix))) return false;
//
//     // Remove clearly irrelevant categories
//     const badPatterns = [
//       // Emotions & social
//       /emotion|smile|heart|angry|sad|cry|face|mood|social/,
//       // Food (except dev culture)
//       /food|drink|pizza|wine|beer|restaurant|cafe|eat|kitchen(?!.*dev)/,
//       // Entertainment & leisure
//       /sport|ball|game(?!.*dev)|music|movie|tv|entertainment/,
//       // Fashion & beauty
//       /cloth|shirt|dress|fashion|beauty|makeup|jewelry/,
//       // Medical (except health-tech)
//       /medical|hospital|pill|injection|medicine|health(?!.*tech)/,
//       // Weather (except cloud tech)
//       /weather|sun|rain|snow(?!.*cloud|.*tech)/,
//       // Animals (except tech mascots)
//       /animal|cat|dog|bird|pet(?!.*python|.*whale|.*gopher|.*penguin|.*docker)/,
//       // Inappropriate content
//       /adult|nsfw|explicit|inappropriate/
//     ];
//
//     return !badPatterns.some(pattern => pattern.test(icon.name));
//   });
//
//   logger.info(`✅ Stage 1 complete: ${allIcons.length} → ${filtered.length} (${((1 - filtered.length / allIcons.length) * 100).toFixed(1)}% filtered)`);
//   return filtered;
// }
//
// // ============================================================================
// // STAGE 2: EDUCATIONAL RELEVANCE ASSESSMENT
// // ============================================================================
//
// async function stage2EducationalScoring(
//   iconBatch: { name: string, code: string }[],
//   batchIndex: number
// ): Promise<ProcessedIcon[]> {
//
//   const prompt = `You are evaluating icons for an AI-powered software development education platform.
//
// CONTEXT: These icons will be searched when AI generates courses and modules:
// - COURSE SEARCHES: Technology names (react, python, database, docker)
// - MODULE SEARCHES: Learning actions (setup, introduction, testing, deployment)
//
// SCORING CRITERIA (1-10):
// 🏆 9-10: ESSENTIAL for coding education
//    - Programming languages (python, javascript, go, rust)
//    - Development tools (git, docker, vscode, terminal)
//    - Core concepts (database, api, security, testing)
//    - Critical actions (deploy, debug, configure, build)
//
// ⭐ 7-8: HIGHLY USEFUL for education
//    - Common UI elements (folder, file, save, search, settings)
//    - Learning metaphors (book, flag, rocket, gear, lightbulb)
//    - Development workflow (code, edit, run, test)
//
// ✅ 5-6: USEFUL for specific contexts
//    - Generic shapes with clear meaning (arrow, circle, square)
//    - Supporting elements (warning, info, check, cross)
//
// ❌ 1-4: LOW educational value
//    - Decorative/artistic elements
//    - Ambiguous or unclear symbols
//    - Rarely used in educational context
//
// VISUAL CLARITY:
// - "excellent": Instantly recognizable, clear at small sizes
// - "good": Clear with context, readable
// - "poor": Unclear, hard to distinguish
//
// RECOGNIZABILITY:
// - "immediate": Developers recognize instantly
// - "context-needed": Clear with surrounding context
// - "obscure": Requires explanation
//
// Icons to evaluate: ${iconBatch.map(i => i.name).join(', ')}
//
// Return comprehensive assessment:`;
//
//   const schema = z.object({
//     icons: z.array(z.object({
//       iconName: z.string().describe("exact icon name from input"),
//       code: z.string().describe("unicode code"),
//       educationalScore: z.number().min(1).max(10).describe("educational value score"),
//       visualClarity: z.enum(["excellent", "good", "poor"]).describe("visual clarity"),
//       recognizability: z.enum(["immediate", "context-needed", "obscure"]).describe("recognition level"),
//       primaryConcept: z.string().describe("main concept this icon represents"),
//       reasoning: z.string().max(100).describe("brief scoring rationale")
//     }))
//   });
//
//   const operation = async () => {
//     const llmService = getDefaultLLMService();
//     return await withTimeout(
//       llmService.structuredRespose(prompt, schema, {
//         model: "gpt-4o-mini", // Fixed model name
//         provider: "openai",
//         temperature: 0.1,
//         // Removed max_tokens to let model determine response length
//       }),
//       CONFIG.LLM_TIMEOUT_MS
//     );
//   };
//
//   try {
//     const result = await retryWithExponentialBackoff(operation);
//
//     const validIcons = (result?.icons || [])
//       .filter(icon => icon.educationalScore >= CONFIG.MIN_EDUCATIONAL_SCORE)
//       .map(icon => ({
//         iconName: icon.iconName,
//         code: icon.code,
//         educationalScore: icon.educationalScore,
//         searchAccuracy: 0, // Will be set in stage 3
//         visualClarity: icon.visualClarity,
//         recognizability: icon.recognizability,
//         primaryConcept: icon.primaryConcept,
//         courseTerms: [],
//         moduleTerms: [],
//         visualTerms: [],
//         educationalContexts: []
//       }));
//
//     logger.info(`Batch ${batchIndex + 1}: ${validIcons.length}/${iconBatch.length} icons passed educational scoring`);
//     return validIcons;
//
//   } catch (error) {
//     logger.error(`Error in batch ${batchIndex + 1}:`, error);
//     // Return empty array instead of throwing to prevent hanging
//     return [];
//   }
// }
//
// // ============================================================================
// // STAGE 3: ENHANCED METADATA GENERATION
// // ============================================================================
//
// async function stage3MetadataGeneration(
//   iconBatch: ProcessedIcon[],
//   batchIndex: number
// ): Promise<ProcessedIcon[]> {
//
//   const prompt = `Generate optimized search metadata for educational platform icons.
//
// METADATA REQUIREMENTS:
// Generate 4 types of search terms for each icon:
//
// 1. **courseTerms**: Technology/framework names for course-level searches
//    - Examples: ["react", "frontend", "component"] for React icon
//    - Examples: ["database", "storage", "sql"] for database icon
//
// 2. **moduleTerms**: Learning action terms for module-level searches
//    - Examples: ["book", "tutorial", "guide"] for book icon
//    - Examples: ["gear", "setup", "configure"] for settings icon
//
// 3. **visualTerms**: What the icon literally looks like
//    - Examples: ["atom", "circle", "orbital"] for React atom icon
//    - Examples: ["cylinder", "stack", "storage"] for database icon
//
// 4. **educationalContexts**: Learning scenarios where used
//    - Examples: ["course-intro", "framework-learning"] 
//    - Examples: ["module-setup", "configuration-guide"]
//
// 5. **searchAccuracy**: How well this icon matches search intent (1-10)
//
// Icons to enhance:
// ${iconBatch.map(i => `${i.iconName} (concept: ${i.primaryConcept})`).join('\n')}
//
// Focus on terms that match how instructors actually search for icons:`;
//
//   const schema = z.object({
//     icons: z.array(z.object({
//       iconName: z.string(),
//       courseTerms: z.array(z.string()).max(6).describe("technology/framework search terms"),
//       moduleTerms: z.array(z.string()).max(6).describe("learning action search terms"),
//       visualTerms: z.array(z.string()).max(4).describe("visual appearance terms"),
//       educationalContexts: z.array(z.string()).max(4).describe("educational usage contexts"),
//       searchAccuracy: z.number().min(1).max(10).describe("search relevance score")
//     }))
//   });
//
//   const operation = async () => {
//     const llmService = getDefaultLLMService();
//     return await withTimeout(
//       llmService.structuredRespose(prompt, schema, {
//         model: "gpt-4o-mini", // Fixed model name
//         provider: "openai",
//         temperature: 0.2,
//         // Removed max_tokens
//       }),
//       CONFIG.LLM_TIMEOUT_MS
//     );
//   };
//
//   try {
//     const result = await retryWithExponentialBackoff(operation);
//
//     const enhancedIcons = iconBatch.map(icon => {
//       const enhanced = result?.icons.find(r => r.iconName === icon.iconName);
//       return enhanced ? {
//         ...icon,
//         courseTerms: enhanced.courseTerms,
//         moduleTerms: enhanced.moduleTerms,
//         visualTerms: enhanced.visualTerms,
//         educationalContexts: enhanced.educationalContexts,
//         searchAccuracy: enhanced.searchAccuracy
//       } : icon;
//     });
//
//     logger.info(`Batch ${batchIndex + 1}: Enhanced metadata for ${enhancedIcons.length} icons`);
//     return enhancedIcons;
//
//   } catch (error) {
//     logger.error(`Error enhancing batch ${batchIndex + 1}:`, error);
//     return iconBatch; // Return original batch instead of throwing
//   }
// }
//
// // ============================================================================
// // STAGE 4: QUALITY VALIDATION & NAME VERIFICATION
// // ============================================================================
//
// function stage4QualityValidation(
//   icons: ProcessedIcon[],
//   originalIcons: { name: string, code: string }[]
// ): ProcessedIcon[] {
//
//   logger.info(`🔍 Stage 4: Validating ${icons.length} icons`);
//
//   const validated = icons.filter(icon => {
//     // Verify icon name exists
//     const exists = originalIcons.some(orig => orig.name === icon.iconName);
//     if (!exists) {
//       logger.warn(`❌ Invalid icon name: ${icon.iconName}`);
//       return false;
//     }
//
//     // Quality gates
//     const passesQuality =
//       icon.educationalScore >= CONFIG.MIN_EDUCATIONAL_SCORE &&
//       icon.searchAccuracy >= CONFIG.MIN_SEARCH_ACCURACY &&
//       icon.visualClarity !== "poor" &&
//       icon.recognizability !== "obscure" &&
//       icon.courseTerms.length > 0 &&
//       icon.moduleTerms.length > 0;
//
//     return passesQuality;
//   });
//
//   logger.info(`✅ Stage 4 complete: ${icons.length} → ${validated.length} icons passed validation`);
//   return validated;
// }
//
// // ============================================================================
// // STAGE 5: SEMANTIC DEDUPLICATION
// // ============================================================================
//
// function stage5SemanticDeduplication(icons: ProcessedIcon[]): ProcessedIcon[] {
//   logger.info(`🔄 Stage 5: Deduplicating ${icons.length} icons`);
//
//   // Group by primary concept
//   const conceptGroups = icons.reduce((groups, icon) => {
//     const concept = icon.primaryConcept.toLowerCase().trim();
//     if (!groups[concept]) groups[concept] = [];
//     groups[concept].push(icon);
//     return groups;
//   }, {} as Record<string, ProcessedIcon[]>);
//
//   const deduplicated: ProcessedIcon[] = [];
//
//   for (const [concept, groupIcons] of Object.entries(conceptGroups)) {
//     if (groupIcons.length === 1) {
//       deduplicated.push(groupIcons[0]);
//       continue;
//     }
//
//     // Select best representative
//     const best = groupIcons.reduce((bestIcon, current) => {
//       const bestScore = calculateQualityScore(bestIcon);
//       const currentScore = calculateQualityScore(current);
//       return currentScore > bestScore ? current : bestIcon;
//     });
//
//     // Merge search terms from duplicates
//     const allCourseTerms = [...new Set(groupIcons.flatMap(i => i.courseTerms))];
//     const allModuleTerms = [...new Set(groupIcons.flatMap(i => i.moduleTerms))];
//     const allVisualTerms = [...new Set(groupIcons.flatMap(i => i.visualTerms))];
//
//     deduplicated.push({
//       ...best,
//       courseTerms: allCourseTerms.slice(0, 8), // Limit for performance
//       moduleTerms: allModuleTerms.slice(0, 8),
//       visualTerms: allVisualTerms.slice(0, 6)
//     });
//   }
//
//   logger.info(`✅ Stage 5 complete: ${icons.length} → ${deduplicated.length} after deduplication`);
//   return deduplicated;
// }
//
// function calculateQualityScore(icon: ProcessedIcon): number {
//   const educationWeight = icon.educationalScore * 0.4;
//   const searchWeight = icon.searchAccuracy * 0.3;
//   const clarityWeight = (icon.visualClarity === "excellent" ? 10 : icon.visualClarity === "good" ? 7 : 4) * 0.2;
//   const recognitionWeight = (icon.recognizability === "immediate" ? 10 : icon.recognizability === "context-needed" ? 6 : 2) * 0.1;
//
//   return educationWeight + searchWeight + clarityWeight + recognitionWeight;
// }
//
// // ============================================================================
// // STAGE 6: OPTIMIZED VECTOR STORAGE
// // ============================================================================
//
// function createOptimizedEmbeddingText(icon: ProcessedIcon): string {
//   const components = [
//     // Primary concept (highest weight)
//     ...Array(4).fill(icon.primaryConcept),
//
//     // Course terms (high weight for technology searches)
//     ...icon.courseTerms.flatMap(term => Array(CONFIG.COURSE_WEIGHT_MULTIPLIER).fill(term)),
//
//     // Module terms (high weight for action searches)
//     ...icon.moduleTerms.flatMap(term => Array(CONFIG.MODULE_WEIGHT_MULTIPLIER).fill(term)),
//
//     // Visual terms (medium weight)
//     ...icon.visualTerms.flatMap(term => Array(CONFIG.CONCEPT_WEIGHT_MULTIPLIER).fill(term)),
//
//     // Educational contexts (lower weight)
//     ...icon.educationalContexts,
//
//     // Clean icon name (exact match capability)
//     icon.iconName.replace(/^nf-/, '').replace(/-/g, ' '),
//     icon.iconName.replace(/^nf-/, '').replace(/-/g, '_') // Alternative format
//   ];
//
//   return components.join(' ').toLowerCase();
// }
//
// async function stage6SaveToPinecone(icons: ProcessedIcon[]): Promise<number> {
//   logger.info(`💾 Stage 6: Saving ${icons.length} icons to Pinecone`);
//
//   const vectorDbService = getDefaultVectorDbService();
//
//   const vectorData = icons.map(icon => ({
//     id: v4(),
//     data: createOptimizedEmbeddingText(icon),
//     metadata: {
//       // Core data
//       iconName: icon.iconName,
//       code: icon.code,
//       primaryConcept: icon.primaryConcept,
//
//       // Quality metrics
//       educationalScore: icon.educationalScore,
//       searchAccuracy: icon.searchAccuracy,
//       visualClarity: icon.visualClarity,
//       recognizability: icon.recognizability,
//
//       // Optimized search terms
//       courseTerms: icon.courseTerms,
//       moduleTerms: icon.moduleTerms,
//       visualTerms: icon.visualTerms,
//       educationalContexts: icon.educationalContexts,
//
//       // Legacy compatibility
//       allSearchTerms: [
//         ...icon.courseTerms,
//         ...icon.moduleTerms,
//         ...icon.visualTerms
//       ]
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
//         index: env.ICONS_PINECONE_INDEX
//       });
//
//       savedCount += batch.length;
//       logger.info(`📊 Progress: ${savedCount}/${vectorData.length} icons saved (batch ${batchNum}/${totalBatches})`);
//
//       // Rate limiting
//       if (i + CONFIG.PINECONE_BATCH_SIZE < vectorData.length) {
//         await new Promise(resolve => setTimeout(resolve, 800));
//       }
//
//     } catch (error) {
//       logger.error(`❌ Error saving batch ${batchNum}:`, error);
//     }
//   }
//
//   logger.info(`✅ Stage 6 complete: ${savedCount} icons saved to Pinecone`);
//   return savedCount;
// }
//
// // ============================================================================
// // MAIN PROCESSING PIPELINE
// // ============================================================================
//
// async function runBatchProcessing<T>(
//   items: T[],
//   batchSize: number,
//   processingFunction: (batch: T[], batchIndex: number) => Promise<any[]>,
//   stageName: string
// ): Promise<any[]> {
//
//   const batches: T[][] = [];
//   for (let i = 0; i < items.length; i += batchSize) {
//     batches.push(items.slice(i, i + batchSize));
//   }
//
//   logger.info(`📊 ${stageName}: Processing ${batches.length} batches`);
//   const results: any[] = [];
//
//   for (let i = 0; i < batches.length; i += CONFIG.CONCURRENT_BATCHES) {
//     const concurrentBatches = batches.slice(i, i + CONFIG.CONCURRENT_BATCHES);
//
//     logger.info(`Processing concurrent batch group ${Math.floor(i / CONFIG.CONCURRENT_BATCHES) + 1}`);
//
//     // Process batches with better error handling
//     const batchPromises = concurrentBatches.map(async (batch, idx) => {
//       try {
//         const result = await processingFunction(batch, i + idx);
//         return result;
//       } catch (error) {
//         logger.error(`Batch ${i + idx + 1} failed completely:`, error);
//         return []; // Return empty array for failed batches
//       }
//     });
//
//     // Use Promise.allSettled instead of Promise.all to prevent hanging
//     const batchResults = await Promise.allSettled(batchPromises);
//
//     // Extract successful results
//     const successfulResults = batchResults
//       .filter((result): result is PromiseFulfilledResult<any[]> => result.status === 'fulfilled')
//       .map(result => result.value)
//       .flat();
//
//     // Log failed batches
//     const failedCount = batchResults.filter(result => result.status === 'rejected').length;
//     if (failedCount > 0) {
//       logger.warn(`${failedCount} batches failed in this group`);
//     }
//
//     results.push(...successfulResults);
//
//     const completed = Math.min(i + CONFIG.CONCURRENT_BATCHES, batches.length);
//     logger.info(`⏳ ${stageName}: ${completed}/${batches.length} batches complete`);
//
//     // Add delay between concurrent batch groups to prevent overwhelming
//     if (i + CONFIG.CONCURRENT_BATCHES < batches.length) {
//       await new Promise(resolve => setTimeout(resolve, CONFIG.BATCH_DELAY_MS));
//     }
//   }
//
//   return results;
// }
//
// export async function processEducationalIcons(): Promise<ProcessingStats> {
//   const startTime = Date.now();
//   logger.info("🚀 Starting Educational Icon Processing");
//
//   try {
//     // Stage 1: Pre-filtering (instant)
//     const stage1Icons = stage1PreFilter(icons);
//
//     // Stage 2: Educational scoring (parallel)
//     const stage2Icons = await runBatchProcessing(
//       stage1Icons,
//       CONFIG.STAGE1_BATCH_SIZE,
//       stage2EducationalScoring,
//       "Educational Scoring"
//     );
//
//     // Stage 3: Metadata generation (parallel)
//     const stage3Icons = await runBatchProcessing(
//       stage2Icons,
//       CONFIG.STAGE2_BATCH_SIZE,
//       stage3MetadataGeneration,
//       "Metadata Generation"
//     );
//
//     // Stage 4: Quality validation (instant)
//     const stage4Icons = stage4QualityValidation(stage3Icons, icons);
//
//     // Stage 5: Semantic deduplication (instant)
//     const stage5Icons = stage5SemanticDeduplication(stage4Icons);
//
//     // Apply final count limit
//     const finalIcons = stage5Icons.length > CONFIG.MAX_FINAL_ICONS
//       ? stage5Icons
//         .sort((a, b) => calculateQualityScore(b) - calculateQualityScore(a))
//         .slice(0, CONFIG.MAX_FINAL_ICONS)
//       : stage5Icons;
//
//     // Stage 6: Save to Pinecone
//     const savedCount = await stage6SaveToPinecone(finalIcons);
//
//     const processingTime = Date.now() - startTime;
//     const stats: ProcessingStats = {
//       stage1Filtered: stage1Icons.length,
//       stage2Scored: stage2Icons.length,
//       stage3Enhanced: stage3Icons.length,
//       stage4Validated: stage4Icons.length,
//       stage5Deduplicated: stage5Icons.length,
//       finalSaved: savedCount,
//       avgEducationalScore: finalIcons.reduce((sum, icon) => sum + icon.educationalScore, 0) / finalIcons.length,
//       processingTimeMs: processingTime
//     };
//
//     // Print final statistics
//     logger.info("\n" + "=".repeat(60));
//     logger.info("🎉 PROCESSING COMPLETE");
//     logger.info("=".repeat(60));
//     logger.info(`⏱️  Total Time: ${(processingTime / 1000).toFixed(1)}s`);
//     logger.info(`📊 Original Icons: ${icons.length.toLocaleString()}`);
//     logger.info(`🔄 Stage 1 (Pre-filter): ${stats.stage1Filtered.toLocaleString()}`);
//     logger.info(`🎯 Stage 2 (Educational): ${stats.stage2Scored.toLocaleString()}`);
//     logger.info(`✨ Stage 3 (Metadata): ${stats.stage3Enhanced.toLocaleString()}`);
//     logger.info(`✅ Stage 4 (Validation): ${stats.stage4Validated.toLocaleString()}`);
//     logger.info(`🔄 Stage 5 (Deduplication): ${stats.stage5Deduplicated.toLocaleString()}`);
//     logger.info(`💾 Final Saved: ${stats.finalSaved.toLocaleString()}`);
//     logger.info(`📈 Avg Educational Score: ${stats.avgEducationalScore.toFixed(1)}/10`);
//     logger.info(`🎯 Retention Rate: ${(stats.finalSaved / icons.length * 100).toFixed(1)}%`);
//     logger.info(`🚀 Processing Rate: ${(icons.length / (processingTime / 1000)).toFixed(0)} icons/sec`);
//
//     return stats;
//
//   } catch (error) {
//     logger.error("❌ Processing failed:", error);
//     throw error;
//   }
// }
//
// // ============================================================================
// // EXECUTION
// // ============================================================================
//
// if (require.main === module) {
//   logger.info("🚀 Starting icon processing script for Tier 4 account...");
//   logger.info(`📊 Total icons to process: ${icons.length.toLocaleString()}`);
//
//   processEducationalIcons()
//     .then((stats) => {
//       logger.info("\n✅ Icon processing completed successfully!");
//       logger.info(`📊 Final results: ${stats.finalSaved} icons saved from ${stats.stage1Filtered} filtered`);
//       logger.info(`💰 Estimated cost: ~${((stats.stage2Scored + stats.stage3Enhanced) * 0.01).toFixed(2)}`);
//       process.exit(0);
//     })
//     .catch((error) => {
//       logger.error("\n❌ Icon processing failed:");
//       logger.error("Error message:", error.message);
//
//       // Helpful debugging for common issues
//       if (error.message.includes("timeout")) {
//         logger.error("💡 Try increasing LLM_TIMEOUT_MS or reducing CONCURRENT_BATCHES");
//       }
//       if (error.message.includes("rate limit") || error.message.includes("429")) {
//         logger.error("💡 Rate limit hit - reduce CONCURRENT_BATCHES");
//       }
//       if (error.message.includes("no results")) {
//         logger.error("💡 Check if icon filtering is too strict");
//       }
//
//       logger.error("Full error:", error);
//       process.exit(1);
//     });
// }
