import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/services/blog.service";
import { GoogleGenAI } from "@google/genai";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blog = await BlogService.getById(id);

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== "") {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
You are an expert SEO specialist.
Analyze this blog post and return a JSON object with:
1. "metaDescription": A compelling, clickable Google search snippet under 155 characters summarizing the value of this post.
2. "tips": An array of exactly 3 short, actionable bullet points to improve search engine rankings for this topic.

Blog Title: ${blog.title}
Topic: ${blog.topic || "General"}
Content Excerpt: ${blog.content.slice(0, 1200)}

Return ONLY valid JSON in this exact format:
{
  "metaDescription": "...",
  "tips": ["tip 1", "tip 2", "tip 3"]
}
        `.trim();

        const candidateModels = ["gemini-2.5-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash-lite"];
        let jsonResult: any = null;

        for (const model of candidateModels) {
          try {
            const res = await ai.models.generateContent({
              model,
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              config: { temperature: 0.3 },
            });

            const rawText = res.text?.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim() || "";
            jsonResult = JSON.parse(rawText);
            if (jsonResult.metaDescription) break;
          } catch {
            // try next candidate
          }
        }

        if (jsonResult) {
          return NextResponse.json(jsonResult);
        }
      } catch (aiErr) {
        console.warn("AI SEO generation fallback:", aiErr);
      }
    }

    // Fallback if AI key is missing or busy
    const fallbackSnippet = blog.content
      .replace(/^#+\s+.*$/gm, "")
      .replace(/```[\s\S]*?```/g, "")
      .trim()
      .slice(0, 150);

    return NextResponse.json({
      metaDescription: `${fallbackSnippet}...`,
      tips: [
        "Include the primary topic keyword in at least two H2 subheadings.",
        "Add internal links to related product documentation or company projects.",
        "Ensure article word count remains above 800 words for competitive queries.",
      ],
    });
  } catch (error: any) {
    console.error("SEO insights error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate SEO insights" }, { status: 500 });
  }
}
