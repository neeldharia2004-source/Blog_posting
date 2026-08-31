import { PublishingPlatform } from "@prisma/client";
import { Publisher, PlatformConfigStatus } from "./types";
import { BloggerPublisher } from "./blogger-publisher";
import { WordPressPublisher } from "./wordpress-publisher";

export class PublisherFactory {
  private static publishers: Map<PublishingPlatform, Publisher> = new Map<PublishingPlatform, Publisher>([
    [PublishingPlatform.BLOGGER, new BloggerPublisher()],
    [PublishingPlatform.WORDPRESS, new WordPressPublisher()],
  ]);

  static getPublisher(platform: PublishingPlatform): Publisher {
    const pub = this.publishers.get(platform);
    if (!pub) {
      throw new Error(`Unsupported publishing platform: ${platform}`);
    }
    return pub;
  }

  static getPlatformConfigs(): PlatformConfigStatus[] {
    return Array.from(this.publishers.values()).map((p) => p.getConfigStatus());
  }
}

export * from "./types";
export * from "./blogger-publisher";
export * from "./wordpress-publisher";
export * from "./markdown-to-html";
