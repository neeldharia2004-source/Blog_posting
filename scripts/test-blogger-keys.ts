import fs from "fs";
import path from "path";

// Clear cached env and reload .env
try {
  const envFile = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^\s*([A-Za-z_0-9]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  }
} catch {}

import { BloggerPublisher } from "../lib/publishing/blogger-publisher";

async function checkBloggerKeys() {
  console.log("🔍 Checking Google Blogger credentials in .env...\n");

  const blogId = process.env.BLOGGER_BLOG_ID;
  const apiKey = process.env.BLOGGER_API_KEY;
  const accessToken = process.env.BLOGGER_ACCESS_TOKEN;
  const clientId = process.env.BLOGGER_CLIENT_ID;
  const refreshToken = process.env.BLOGGER_REFRESH_TOKEN;

  console.log(`BLOGGER_BLOG_ID: ${blogId ? `"${blogId}"` : "❌ NOT SET"}`);
  console.log(`BLOGGER_API_KEY: ${apiKey && apiKey.trim() !== "" ? `"${apiKey.slice(0, 8)}...${apiKey.slice(-4)}"` : "❌ NOT SET"}`);
  console.log(`BLOGGER_CLIENT_ID: ${clientId ? `"${clientId.slice(0, 15)}..."` : "❌ NOT SET"}`);
  console.log(`BLOGGER_REFRESH_TOKEN: ${refreshToken && refreshToken.trim() !== "" ? `"${refreshToken.slice(0, 10)}..."` : "❌ NOT SET"}`);

  const publisher = new BloggerPublisher();
  const configStatus = publisher.getConfigStatus();

  console.log("\nConfig Status:", configStatus);

  if (!configStatus.isConfigured) {
    console.error("\n❌ Configuration incomplete. Missing variables:", configStatus.missingFields.join(", "));
    process.exit(1);
  }

  console.log("\n📡 Testing live post publication to Google Blogger...");

  const result = await publisher.publish({
    title: "Test Automated Post from AutoBlog.AI",
    content: `
# Welcome to AutoBlog.AI
This is a test automated post published directly through the Google Blogger API v3.

## System Features
- **Context Grounding**: Deep alignment with product and brand guidelines.
- **Autonomous Publishing**: Multi-channel distribution to Blogger and WordPress.
- **Observability**: Live status tracking and permalinks.
    `.trim(),
    tags: ["AutoBlog", "AI", "Test"],
  });

  if (!result.success) {
    console.error("\n❌ Blogger Publishing Failed:", result.error);
    process.exit(1);
  }

  console.log("\n🎉 SUCCESS! Published blog post directly to Google Blogger:");
  console.log(`- External Post ID: ${result.externalPostId}`);
  console.log(`- Live URL: ${result.url}`);
}

checkBloggerKeys();
