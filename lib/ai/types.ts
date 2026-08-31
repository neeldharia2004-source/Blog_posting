export interface GenerationOptions {
  title: string;
  topic?: string | null;
  structuredContext: string;
  userInstructions?: string | null;
  model?: string;
  temperature?: number;
}

export interface GenerationResult {
  content: string;
  model: string;
  tokensUsed?: number;
}

export interface AIProvider {
  name: string;
  generateBlog(options: GenerationOptions): Promise<GenerationResult>;
}
