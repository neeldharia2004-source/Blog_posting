import { Publisher, PublishOptions, PublishResult, PlatformConfigStatus } from "./types";
import { PublishingPlatform } from "@prisma/client";
import { markdownToHtml } from "./markdown-to-html";

export class WordPressPublisher implements Publisher {
  platform = PublishingPlatform.WORDPRESS;
  name = "WordPress";

  private siteUrl: string | undefined;
  private username: string | undefined;
  private appPassword: string | undefined;

  constructor() {
    this.siteUrl = process.env.WORDPRESS_SITE_URL
      ?.replace(/\/wp-admin(\/.*)?$/, "")
      ?.replace(/\/wp-login\.php$/, "")
      ?.replace(/\/$/, "");
    this.username = process.env.WORDPRESS_USERNAME;
    this.appPassword = process.env.WORDPRESS_APPLICATION_PASSWORD;
  }

  isConfigured(): boolean {
    return Boolean(this.siteUrl && this.username && this.appPassword);
  }

  getConfigStatus(): PlatformConfigStatus {
    const missing: string[] = [];
    if (!this.siteUrl) missing.push("WORDPRESS_SITE_URL");
    if (!this.username) missing.push("WORDPRESS_USERNAME");
    if (!this.appPassword) missing.push("WORDPRESS_APPLICATION_PASSWORD");

    return {
      platform: this.platform,
      name: this.name,
      isConfigured: missing.length === 0,
      missingFields: missing,
      description: "WordPress REST API v2 publishing via Application Passwords.",
    };
  }

  async publish(options: PublishOptions): Promise<PublishResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        platform: this.platform,
        error: `WordPress credentials missing. Required environment variables: ${this.getConfigStatus().missingFields.join(", ")}`,
      };
    }

    try {
      const htmlContent = markdownToHtml(options.content);
      const endpoint = `${this.siteUrl}/wp-json/wp/v2/posts`;

      const credentials = Buffer.from(`${this.username}:${this.appPassword}`).toString("base64");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
          title: options.title,
          content: htmlContent,
          status: "publish",
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      let data: any;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const rawText = await response.text();
        throw new Error(
          `WordPress returned HTTP ${response.status} (${response.statusText}). Check your site URL: ${this.siteUrl}`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || `WordPress API returned status ${response.status}`);
      }

      return {
        success: true,
        platform: this.platform,
        externalPostId: data.id ? String(data.id) : null,
        url: data.link || `${this.siteUrl}/?p=${data.id}`,
      };
    } catch (err: any) {
      console.error("WordPress Publishing Error:", err);
      return {
        success: false,
        platform: this.platform,
        error: err.message || "Failed to publish to WordPress",
      };
    }
  }
}
