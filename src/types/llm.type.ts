import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
type LLMProvider = "openai" | "gemini"
type LLMOpts = {
  provider: LLMProvider,
  model: string,
  temperature?: number,
}

type ConverstionType = (AIMessage | SystemMessage | HumanMessage)[];

export type {
  LLMProvider,
  LLMOpts,
  ConverstionType
}



