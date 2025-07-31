import { getDefaultLLMService, getDefaultLogger } from "@/config/defaults";
import { validateBody } from "@/lib/bodyValidator";
import { apiErrorHandler, responseCreator } from "@/lib/utils/apiResponse.utils";
import { ErrorResponse } from "@/types";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  diagram: z.string().nonempty()
})

const oupputSchema = z.object({
  fixedDiagram: z.string().describe("Fixed mermaid diagram, with no syntax errors")
})
function getFixingPrompt(diagram: string) {
  return `
given this mermaid diagram :${diagram}, fix the syntax , or any other problem with the diagram.
`
}

export async function POST(req: NextRequest) {
  try {
    const logger = getDefaultLogger();
    const llmService = getDefaultLLMService();
    logger.info("Fixing mermaid diagram");
    const data = await validateBody(schema, req);
    const response = await llmService.structuredResponse(getFixingPrompt(data.diagram), oupputSchema, {
      provider: "openai",
      model: "gpt-4.1-mini"
    });
    logger.info("Fixed mermaid diagram", { fixedDiagram: response.parsed.fixedDiagram });
    return responseCreator(200, true, "Fixed mermaid diagram", { diagram: response.parsed.fixedDiagram });
  } catch (err) {
    return apiErrorHandler(err as ErrorResponse);
  }
}
