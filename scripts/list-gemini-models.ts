import fs from "fs";
import path from "path";

try {
  const envFile = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^\s*([A-Za-z_0-9]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match) process.env[match[1]] = match[2];
  }
} catch {}

import { GoogleGenAI } from "@google/genai";

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.list();
  for await (const m of response) {
    console.log(m.name);
  }
}

listModels().catch(console.error);
