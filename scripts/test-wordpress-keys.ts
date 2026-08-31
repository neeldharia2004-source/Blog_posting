import fs from "fs";
import path from "path";

// Load .env
try {
  const envFile = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^\s*([A-Za-z_0-9]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  }
} catch {}

import { WordPressPublisher } from "../lib/publishing/wordpress-publisher";

async function checkWordPress() {
  console.log("🔍 Checking WordPress credentials in .env...\n");

  const siteUrl = process.env.WORDPRESS_SITE_URL;
  const username = process.env.WORDPRESS_USERNAME;
  const appPassword = process.env.WORDPRESS_APPLICATION_PASSWORD;

  console.log(`WORDPRESS_SITE_URL: "${siteUrl}"`);
  console.log(`WORDPRESS_USERNAME: "${username}"`);
  console.log(`WORDPRESS_APPLICATION_PASSWORD: "${appPassword ? `${appPassword.slice(0, 4)}...` : "NOT SET"}"`);

  const publisher = new WordPressPublisher();
  console.log("\nIs configured:", publisher.isConfigured());

  console.log("\n📡 Testing live post publication to WordPress REST API...");

  const result = await publisher.publish({
    title: "How Clean Energy Systems Scale Sustainably in 2026",
    content: `
# Sustainable Grid Modernization
Modern clean energy distribution networks require real-time load balancing and high resilience.

## Core Pillars
- **Distributed Battery Storage**: Smoothing peak power demand spikes.
- **Renewable Microgrids**: Autonomous islanding during transmission faults.

> "Decarbonizing industrial energy grids is achievable through deterministic edge telemetry."
    `.trim(),
    topic: "Clean Energy & Grid Resilience",
  });

  if (!result.success) {
    console.error("\n❌ WordPress Publishing Failed:", result.error);
    process.exit(1);
  }

  console.log("\n🎉 SUCCESS! Published blog post directly to WordPress:");
  console.log(`- External Post ID: ${result.externalPostId}`);
  console.log(`- Live URL: ${result.url}`);
}

checkWordPress();
