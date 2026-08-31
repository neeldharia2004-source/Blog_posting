import { PublishingPlatform } from "@prisma/client";

export interface PublishOptions {
  title: string;
  content: string; // Markdown content
  topic?: string | null;
  tags?: string[];
}

export interface PublishResult {
  success: boolean;
  platform: PublishingPlatform;
  externalPostId?: string | null;
  url?: string | null;
  error?: string | null;
}

export interface PlatformConfigStatus {
  platform: PublishingPlatform;
  name: string;
  isConfigured: boolean;
  missingFields: string[];
  description: string;
}

export interface Publisher {
  platform: PublishingPlatform;
  name: string;
  isConfigured(): boolean;
  getConfigStatus(): PlatformConfigStatus;
  publish(options: PublishOptions): Promise<PublishResult>;
}
