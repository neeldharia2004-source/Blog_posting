"use client";

import React, { useMemo, useState } from "react";
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Globe, 
  Copy, 
  Check, 
  BookOpen, 
  TrendingUp, 
  HelpCircle,
  RotateCw
} from "lucide-react";

interface SEOAnalyzerProps {
  title: string;
  topic?: string | null;
  content: string;
  companyName: string;
  blogId: string;
}

export function SEOAnalyzer({ title, topic, content, companyName, blogId }: SEOAnalyzerProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMetaDescription, setAiMetaDescription] = useState<string | null>(null);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [copiedMeta, setCopiedMeta] = useState(false);

  // Real-time deterministic SEO calculations
  const analysis = useMemo(() => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const words = cleanContent.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 1. Title Length Score (Ideal 45 - 65 chars)
    const titleLength = cleanTitle.length;
    let titleScore = 0;
    let titleStatus: "good" | "warning" | "bad" = "warning";
    let titleMsg = "";

    if (titleLength >= 40 && titleLength <= 65) {
      titleScore = 20;
      titleStatus = "good";
      titleMsg = `Optimal length (${titleLength} chars). Fits Google search cards perfectly.`;
    } else if (titleLength > 65) {
      titleScore = 12;
      titleStatus = "warning";
      titleMsg = `Slightly long (${titleLength} chars). Google may truncate after ~60 chars.`;
    } else if (titleLength >= 20) {
      titleScore = 14;
      titleStatus = "warning";
      titleMsg = `Short (${titleLength} chars). Consider adding specific keywords.`;
    } else {
      titleScore = 5;
      titleStatus = "bad";
      titleMsg = "Title is too short.";
    }

    // 2. Content Length / Depth Score (Ideal 600 - 2500 words)
    let contentScore = 0;
    let contentStatus: "good" | "warning" | "bad" = "warning";
    let contentMsg = "";

    if (wordCount >= 600) {
      contentScore = 25;
      contentStatus = "good";
      contentMsg = `Comprehensive depth (${wordCount} words). Strong authority signal.`;
    } else if (wordCount >= 300) {
      contentScore = 18;
      contentStatus = "warning";
      contentMsg = `Moderate length (${wordCount} words). Aim for 600+ words for better rankings.`;
    } else {
      contentScore = 8;
      contentStatus = "bad";
      contentMsg = `Short article (${wordCount} words). Search engines prefer in-depth guides.`;
    }

    // 3. Headings Structure (H1 and H2 presence)
    const h1Count = (cleanContent.match(/^#\s+/gm) || []).length;
    const h2Count = (cleanContent.match(/^##\s+/gm) || []).length;
    const h3Count = (cleanContent.match(/^###\s+/gm) || []).length;

    let headingScore = 0;
    let headingStatus: "good" | "warning" | "bad" = "warning";
    let headingMsg = "";

    if (h2Count >= 3) {
      headingScore = 20;
      headingStatus = "good";
      headingMsg = `Well structured (${h2Count} H2 subheadings, ${h3Count} H3 subheadings).`;
    } else if (h2Count >= 1) {
      headingScore = 12;
      headingStatus = "warning";
      headingMsg = `Found ${h2Count} H2 subheadings. Add more sections to improve scannability.`;
    } else {
      headingScore = 5;
      headingStatus = "bad";
      headingMsg = "No ## H2 subheadings detected. Use subheadings to break up paragraphs.";
    }

    // 4. Keyword / Topic Presence
    let keywordScore = 0;
    let keywordStatus: "good" | "warning" | "bad" = "warning";
    let keywordMsg = "";

    if (topic && topic.trim()) {
      const topicWords = topic.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      let foundCount = 0;
      const lowerContent = cleanContent.toLowerCase();

      topicWords.forEach((kw) => {
        if (lowerContent.includes(kw)) foundCount++;
      });

      const coverageRatio = topicWords.length > 0 ? foundCount / topicWords.length : 1;

      if (coverageRatio >= 0.7) {
        keywordScore = 20;
        keywordStatus = "good";
        keywordMsg = `High topic keyword alignment (${Math.round(coverageRatio * 100)}% coverage).`;
      } else if (coverageRatio >= 0.3) {
        keywordScore = 12;
        keywordStatus = "warning";
        keywordMsg = "Partial keyword coverage. Mention core topic terms in H2 subheadings.";
      } else {
        keywordScore = 6;
        keywordStatus = "bad";
        keywordMsg = "Topic terms rarely mentioned in article body.";
      }
    } else {
      keywordScore = 15; // default neutral
      keywordStatus = "good";
      keywordMsg = "Add a topic to evaluate targeted keyword density.";
    }

    // 5. Readability / Flow Score (Sentence length & reading level)
    const sentences = cleanContent.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;
    
    let readabilityScore = 0;
    let readabilityStatus: "good" | "warning" | "bad" = "good";
    let readabilityMsg = "";

    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 22) {
      readabilityScore = 15;
      readabilityStatus = "good";
      readabilityMsg = `Clear & engaging flow (~${avgWordsPerSentence} words per sentence).`;
    } else if (avgWordsPerSentence > 22) {
      readabilityScore = 10;
      readabilityStatus = "warning";
      readabilityMsg = `Complex sentence length (~${avgWordsPerSentence} words/sentence). Break up long sentences.`;
    } else {
      readabilityScore = 12;
      readabilityStatus = "good";
      readabilityMsg = "Concise and easy to read.";
    }

    // Total Score
    const totalScore = Math.min(100, titleScore + contentScore + headingScore + keywordScore + readabilityScore);

    // Fallback Meta Description from first paragraph
    const firstParagraph = cleanContent
      .replace(/^#+\s+.*$/gm, "")
      .replace(/```[\s\S]*?```/g, "")
      .trim()
      .slice(0, 155);

    return {
      totalScore,
      wordCount,
      titleLength,
      h2Count,
      h3Count,
      avgWordsPerSentence,
      defaultMeta: firstParagraph ? `${firstParagraph}...` : `${cleanTitle} - Learn more about insights from ${companyName}.`,
      checks: [
        { label: "Title Tag Length", score: titleScore, max: 20, status: titleStatus, msg: titleMsg },
        { label: "Content Depth & Length", score: contentScore, max: 25, status: contentStatus, msg: contentMsg },
        { label: "Heading Hierarchy (H2/H3)", score: headingScore, max: 20, status: headingStatus, msg: headingMsg },
        { label: "Topic Keyword Alignment", score: keywordScore, max: 20, status: keywordStatus, msg: keywordMsg },
        { label: "Readability & Sentence Flow", score: readabilityScore, max: 15, status: readabilityStatus, msg: readabilityMsg },
      ],
    };
  }, [title, topic, content, companyName]);

  const handleGenerateAiSeo = async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}/seo-insights`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setAiMetaDescription(data.metaDescription);
        setAiTips(data.tips || []);
      }
    } catch (err) {
      console.error("AI SEO generation error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const activeMetaDescription = aiMetaDescription || analysis.defaultMeta;

  const copyMetaToClipboard = () => {
    navigator.clipboard.writeText(activeMetaDescription);
    setCopiedMeta(true);
    setTimeout(() => setCopiedMeta(false), 2000);
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Overall SEO Score Badge */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">SEO & Quality Score</h3>
              <p className="text-[11px] text-slate-400">Search ranking and scannability evaluation</p>
            </div>
          </div>

          <div className={`flex items-baseline gap-1 px-4 py-2 rounded-2xl border font-black ${getScoreColor(analysis.totalScore)}`}>
            <span className="text-2xl">{analysis.totalScore}</span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              analysis.totalScore >= 80
                ? "bg-emerald-500"
                : analysis.totalScore >= 60
                ? "bg-amber-500"
                : "bg-rose-500"
            }`}
            style={{ width: `${analysis.totalScore}%` }}
          />
        </div>
      </div>

      {/* 2. Google SERP Search Snippet Mockup Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-indigo-600" />
            Google Search Preview (SERP)
          </h4>
          <button
            onClick={copyMetaToClipboard}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            {copiedMeta ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            {copiedMeta ? "Copied!" : "Copy Meta Description"}
          </button>
        </div>

        {/* Google Result Card Simulation */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-1 font-sans">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>https://yourdomain.com</span>
            <span>›</span>
            <span>blog</span>
            <span>›</span>
            <span className="text-slate-400 truncate max-w-[140px]">
              {title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}
            </span>
          </div>

          <h5 className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer line-clamp-1 leading-snug">
            {title || "Blog Title Preview"}
          </h5>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {activeMetaDescription}
          </p>
        </div>

        {/* Gemini AI Meta Generator Button */}
        <button
          onClick={handleGenerateAiSeo}
          disabled={aiLoading}
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-linear-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 text-indigo-700 border border-indigo-200/80 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          {aiLoading ? (
            <>
              <RotateCw className="h-3.5 w-3.5 animate-spin" />
              Generating Meta with Gemini AI...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Optimize Meta & SEO Tips with Gemini AI
            </>
          )}
        </button>

        {/* AI Tips Callout */}
        {aiTips.length > 0 && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs text-indigo-950">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Gemini Ranking Suggestions:
            </span>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              {aiTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 3. Detailed Audit Checklist */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          SEO Health Checklist
        </h4>

        <div className="space-y-3 pt-1">
          {analysis.checks.map((check, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 flex items-start gap-3"
            >
              {check.status === "good" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : check.status === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              )}

              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{check.label}</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {check.score}/{check.max} pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{check.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
