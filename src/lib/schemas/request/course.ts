import z from "zod";

const courseGenerationRequestSchema = z.object({
  userQuery: z.string(),
})

export { courseGenerationRequestSchema };
