import { Publisher, PublishOptions, PublishResult, PlatformConfigStatus } from "./types";
import { PublishingPlatform } from "@prisma/client";
import { markdownToHtml } from "./markdown-to-html";

export class BloggerPublisher implements Publisher {
  platform = PublishingPlatform.BLOGGER;
  name = "Google Blogger";

  private blogId: string | undefined;
  private apiKey: string | undefined;
  private accessToken: string | undefined;
  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private refreshToken: string | undefined;

  constructor() {
    this.blogId = process.env.BLOGGER_BLOG_ID;
    this.apiKey = process.env.BLOGGER_API_KEY;
    this.accessToken = process.env.BLOGGER_ACCESS_TOKEN;
    this.clientId = process.env.BLOGGER_CLIENT_ID;
    this.clientSecret = process.env.BLOGGER_CLIENT_SECRET;
    this.refreshToken = process.env.BLOGGER_REFRESH_TOKEN;
  }

  isConfigured(): boolean {
    const hasBlogId = Boolean(this.blogId && this.blogId.trim() !== "");
    const hasOAuth = Boolean(this.clientId && this.clientSecret && this.refreshToken);
    const hasTokenOrKey = Boolean(this.apiKey || this.accessToken);

    return hasBlogId && (hasOAuth || hasTokenOrKey);
  }

  getConfigStatus(): PlatformConfigStatus {
    const missing: string[] = [];
    if (!this.blogId) missing.push("BLOGGER_BLOG_ID");

    const hasOAuth = Boolean(this.clientId && this.clientSecret && this.refreshToken);
    const hasTokenOrKey = Boolean(this.apiKey || this.accessToken);

    if (!hasOAuth && !hasTokenOrKey) {
      if (this.clientId && this.clientSecret && !this.refreshToken) {
        missing.push("BLOGGER_REFRESH_TOKEN (or BLOGGER_API_KEY / BLOGGER_ACCESS_TOKEN)");
      } else {
        missing.push("BLOGGER_API_KEY or BLOGGER_REFRESH_TOKEN");
      }
    }

    return {
      platform: this.platform,
      name: this.name,
      isConfigured: missing.length === 0,
      missingFields: missing,
      description: "Google Blogger v3 REST API integration for automated post syndication.",
    };
  }

  /**
   * Automatically fetches a fresh OAuth2 access token if refreshToken is present
   */
  private async getValidAccessToken(): Promise<string | null> {
    if (this.accessToken) return this.accessToken;

    if (this.clientId && this.clientSecret && this.refreshToken) {
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            refresh_token: this.refreshToken,
            grant_type: "refresh_token",
          }),
        });

        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          return tokenData.access_token;
        }
        console.error("Failed to refresh Blogger access token:", tokenData);
      } catch (tokenErr) {
        console.error("Error refreshing Blogger OAuth token:", tokenErr);
      }
    }

    return null;
  }

  async publish(options: PublishOptions): Promise<PublishResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        platform: this.platform,
        error: `Blogger credentials missing. Required: ${this.getConfigStatus().missingFields.join(", ")}`,
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

      const activeToken = await this.getValidAccessToken();

      let url = `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts/`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
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
