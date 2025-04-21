// Uncommnet this file , to populate vector db with icon data
// import { getDefaultLLMService, getDefaultVectorDbService } from "@/config/defaults";
// import icons from "@/lib/providers/icons.list.provider";
// import { z } from "zod";
// import { v4 } from "uuid"
// import env from "@/config/env.config";
//
// const CONCURRENT_BATCHES = 25;
// const ICONS_PER_BATCH = 20;
// const KEYWORDS_PER_BATCH = 6;
// const PINECONE_BATCH_SIZE = 200;
//
// async function createIconMetadata(icons: { name: string, code: string, }[], batchIndex: number) {
//   try {
//     console.log(`Starting metadata generation for batch ${batchIndex + 1}`);
//     const prompt = `you are expect at creating meta data for icons. 
// you will get ${ICONS_PER_BATCH}, for each of the icon generate ${KEYWORDS_PER_BATCH} keywords that will be used for symantically searching the icons
// icons: ${JSON.stringify(icons, null, 2)}
// `;
//     const outputSchema = z.object({
//       icons: z.array(z.object({
//         iconName: z.string().describe("nerd font name of the icon"),
//         keywords: z.array(z.string()).describe("keywords for the icon"),
//         code: z.string().describe("unicode code point for the icon"),
//       }))
//     });
//
//     const llmService = getDefaultLLMService();
//     const result = await llmService.structuredRespose(prompt, outputSchema, {
//       model: "gpt-4.1-nano",
//       provider: "openai"
//     });
//
//     console.log(`Completed metadata generation for batch ${batchIndex + 1}`);
//     return result?.icons || [];
//   } catch (error) {
//     console.error(`Error generating metadata for batch ${batchIndex + 1}:`, error);
//     return [];
//   }
// }
//
// async function saveToPineconeInBatches(allIcons: { iconName: string, keywords: string[], code: string }[]) {
//   const vectorDbservice = getDefaultVectorDbService();
//   const totalToSave = allIcons.length;
//   console.log(`Starting to save ${totalToSave} icons to Pinecone in batches of ${PINECONE_BATCH_SIZE}`);
//
//   // Convert all icons to the format needed for Pinecone
//   const iconsToSave = allIcons.map((icon) => {
//     return {
//       id: v4(),
//       data: icon.keywords.join(","),
//       metadata: {
//         iconName: icon.iconName,
//         code: icon.code,
//         keywords: icon.keywords,
//       }
//     };
//   });
//
//   let savedCount = 0;
//   for (let i = 0; i < iconsToSave.length; i += PINECONE_BATCH_SIZE) {
//     const batch = iconsToSave.slice(i, i + PINECONE_BATCH_SIZE);
//     console.log(`Saving Pinecone batch ${Math.floor(i / PINECONE_BATCH_SIZE) + 1}/${Math.ceil(iconsToSave.length / PINECONE_BATCH_SIZE)} (${batch.length} icons)`);
//
//     try {
//       await vectorDbservice.saveMultiple(batch, {
//         model: env.DEFAULT_EMBEDDING_MODEL,
//         index: env.ICONS_PINECONE_INDEX
//       });
//
//       savedCount += batch.length;
//       console.log(`Progress: ${savedCount}/${totalToSave} icons saved to Pinecone`);
//     } catch (error) {
//       console.error(`Error saving batch to Pinecone:`, error);
//     }
//
//     if (i + PINECONE_BATCH_SIZE < iconsToSave.length) {
//       await new Promise(resolve => setTimeout(resolve, 1000));
//     }
//   }
//
//   console.log(`Completed saving ${savedCount}/${totalToSave} icons to Pinecone`);
//   return savedCount;
// }
//
// async function batchProcessIcons() {
//   const totalIcons = icons.length;
//   console.log(`Starting processing of ${totalIcons} total icons`);
//
//   const batches = [];
//   for (let i = 0; i < totalIcons; i += ICONS_PER_BATCH) {
//     batches.push(icons.slice(i, i + ICONS_PER_BATCH));
//   }
//
//   console.log(`Created ${batches.length} batches of ${ICONS_PER_BATCH} icons each`);
//   console.log(`Processing metadata with ${CONCURRENT_BATCHES} concurrent batches`);
//
//   const allGeneratedIcons: { iconName: string, keywords: string[], code: string }[] = [];
//   let completedBatches = 0;
//
//   for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
//     const batchPromises = [];
//
//     for (let j = 0; j < CONCURRENT_BATCHES && i + j < batches.length; j++) {
//       batchPromises.push(createIconMetadata(batches[i + j], i + j));
//     }
//
//     const results = await Promise.all(batchPromises);
//
//     results.forEach(batchIcons => {
//       allGeneratedIcons.push(...batchIcons);
//     });
//
//     completedBatches += batchPromises.length;
//     console.log(`Metadata generation progress: ${completedBatches}/${batches.length} batches (${allGeneratedIcons.length} icons generated)`);
//   }
//
//   console.log(`Metadata generation complete. Generated metadata for ${allGeneratedIcons.length} icons.`);
//
//   const savedCount = await saveToPineconeInBatches(allGeneratedIcons);
//
//   return { generatedCount: allGeneratedIcons.length, savedCount };
// }
//
// (async () => {
//   try {
//     const result = await batchProcessIcons();
//     console.log(`Batch processing summary: Generated metadata for ${result.generatedCount} icons, saved ${result.savedCount} to Pinecone`);
//   } catch (error) {
//     console.error("Error in batch processing:", error);
//   }
// })();
