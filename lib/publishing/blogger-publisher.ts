import { Publisher, PublishOptions, PublishResult, PlatformConfigStatus } from "./types";
import { PublishingPlatform } from "@prisma/client";
import { markdownToHtml } from "./markdown-to-html";

export class BloggerPublisher implements Publisher {
  platform = PublishingPlatform.BLOGGER;
  name = "Google Blogger";

  private blogId: string | undefined;
  private apiKey: string | undefined;
  private accessToken: string | undefined;

  constructor() {
    this.blogId = process.env.BLOGGER_BLOG_ID;
    this.apiKey = process.env.BLOGGER_API_KEY;
    this.accessToken = process.env.BLOGGER_ACCESS_TOKEN;
  }

  isConfigured(): boolean {
    return Boolean(this.blogId && (this.apiKey || this.accessToken));
  }

  getConfigStatus(): PlatformConfigStatus {
    const missing: string[] = [];
    if (!this.blogId) missing.push("BLOGGER_BLOG_ID");
    if (!this.apiKey && !this.accessToken) missing.push("BLOGGER_API_KEY or BLOGGER_ACCESS_TOKEN");

    return {
      platform: this.platform,
      name: this.name,
      isConfigured: missing.length === 0,
      missingFields: missing,
      description: "Google Blogger v3 REST API integration for automated post syndication.",
    };
  }

  async publish(options: PublishOptions): Promise<PublishResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        platform: this.platform,
        error: `Blogger credentials missing. Required environment variables: ${this.getConfigStatus().missingFields.join(", ")}`,
      };
    }

    try {
      const htmlContent = markdownToHtml(options.content);
      const postPayload: any = {
        kind: "blogger#post",
        title: options.title,
        content: htmlContent,
      };

      if (options.tags && options.tags.length > 0) {
        postPayload.labels = options.tags;
      }

      let url = `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts/`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.accessToken) {
        headers["Authorization"] = `Bearer ${this.accessToken}`;
      } else if (this.apiKey) {
        url += `?key=${this.apiKey}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(postPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `Blogger API returned status ${response.status}`);
      }

      return {
        success: true,
        platform: this.platform,
        externalPostId: data.id ? String(data.id) : null,
        url: data.url || `https://${this.blogId}.blogspot.com/posts/${data.id}`,
      };
    } catch (err: any) {
      console.error("Blogger Publishing Error:", err);
      return {
        success: false,
        platform: this.platform,
        error: err.message || "Failed to publish to Google Blogger",
      };
    }
  }
}
