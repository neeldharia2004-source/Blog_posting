import { AIProvider } from "./types";
import { GeminiProvider } from "./gemini-provider";

export function getAIProvider(): AIProvider {
  return new GeminiProvider();
}

export * from "./types";
