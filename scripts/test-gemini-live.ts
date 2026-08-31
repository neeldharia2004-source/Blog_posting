import fs from "fs";
import path from "path";

// Load .env manually if process.env.GEMINI_API_KEY is not already set
if (!process.env.GEMINI_API_KEY) {
  try {
    const envFile = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
    for (const line of envFile.split("\n")) {
      const match = line.match(/^\s*([A-Za-z_0-9]+)\s*=\s*["']?(.*?)["']?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    }
  } catch {}
}

import { GeminiProvider } from "../lib/ai/gemini-provider";

async function testLiveGemini() {
  console.log("🔍 Checking Gemini API Key configuration...\n");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.error("❌ GEMINI_API_KEY is empty in .env!");
    process.exit(1);
  }

  console.log(`🔑 GEMINI_API_KEY detected: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);
  console.log("📡 Sending test prompt to Google Gemini API (gemini-2.5-flash)...");

  const provider = new GeminiProvider();
  const startTime = Date.now();

  try {
    const result = await provider.generateBlog({
      title: "The Future of Autonomous AI Agents in 2026",
      topic: "Multi-Agent System Orchestration",
      structuredContext: `
[COMPANY INFORMATION]
Company Name: Acme Cloud Technologies
Company Overview: Edge AI infrastructure provider.

[PROJECT CONTEXT DOCUMENTS]
- Document 1: Multi-agent systems with sub-50ms execution loops and strict schema validation.
      `.trim(),
      userInstructions: "Write a short 2-paragraph introduction showcasing the power of context-aware AI.",
    });

    const elapsed = Date.now() - startTime;
    console.log(`\n🎉 SUCCESS! Gemini responded in ${elapsed}ms using model: "${result.model}"`);
    console.log("\n--- Live Gemini Generated Output Preview ---");
    console.log(result.content.slice(0, 400) + "...\n");
  } catch (err: any) {
    console.error("❌ Gemini API invocation failed:", err.message);
    process.exit(1);
  }
}

testLiveGemini();
