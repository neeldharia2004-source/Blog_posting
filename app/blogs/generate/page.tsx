"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowLeft, 
  Building2, 
  FolderKanban, 
  Layers, 
  Package, 
  FileBox, 
  AlertCircle,
  HelpCircle,
  FileCode,
  CheckCircle2
} from "lucide-react";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";

interface Product {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
  products: Product[];
}

interface ContextFileRef {
  id: string;
  fileName: string;
  fileType: string;
}

interface ProjectDetail {
  id: string;
  name: string;
  contextFiles: ContextFileRef[];
}

interface CompanyDetail {
  id: string;
  name: string;
  sections: Section[];
  projects: ProjectDetail[];
}

export default function GenerateBlogPage() {
  const router = useRouter();

  const [companies, setCompanies] = useState<CompanyDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [userInstructions, setUserInstructions] = useState("");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch all companies with full hierarchy
    fetch("/api/companies")
      .then((res) => res.json())
      .then(async (data) => {
        // Fetch detailed companies with sections, products & projects
        const detailed = await Promise.all(
          data.map(async (c: { id: string }) => {
            const res = await fetch(`/api/companies/${c.id}`);
            return res.json();
          })
        );
        setCompanies(detailed);

        if (detailed.length > 0) {
          const firstComp = detailed[0];
          setSelectedCompanyId(firstComp.id);
          if (firstComp.projects.length > 0) {
            setSelectedProjectId(firstComp.projects[0].id);
          }
        }
      })
      .catch((err) => console.error("Error loading generator data:", err))
      .finally(() => setLoading(false));
  }, []);

  const activeCompany = companies.find((c) => c.id === selectedCompanyId);
  const activeProject = activeCompany?.projects.find((p) => p.id === selectedProjectId);
  const availableSections = activeCompany?.sections || [];
  const activeSection = availableSections.find((s) => s.id === selectedSectionId);
  const availableProducts = activeSection ? activeSection.products : [];

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const comp = companies.find((c) => c.id === companyId);
    if (comp && comp.projects.length > 0) {
      setSelectedProjectId(comp.projects[0].id);
    } else {
      setSelectedProjectId("");
    }
    setSelectedSectionId("");
    setSelectedProductId("");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError("Please select a valid project.");
      return;
    }
    if (!title.trim()) {
      setError("Blog title is required.");
      return;
    }

    setError("");
    setGenerating(true);

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/blogs/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          topic: topic.trim() || undefined,
          userInstructions: userInstructions.trim() || undefined,
          sectionId: selectedSectionId || undefined,
          productId: selectedProductId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate blog");
      }

      // Redirect immediately to the generated blog editor
      router.push(`/blogs/${data.id}`);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate blog. Check API settings.");
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Blogs
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Context-Aware Blog Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Ground Gemini AI in company background, product specs, and project research documents.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Organizational Context Selection */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-600" />
            1. Select Organizational Context
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Company *
              </label>
              <select
                required
                value={selectedCompanyId}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Project / Content Campaign *
              </label>
              <select
                required
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {activeCompany?.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Section & Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Target Section <span className="text-[10px] text-slate-400 lowercase">(optional)</span>
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => {
                  setSelectedSectionId(e.target.value);
                  setSelectedProductId("");
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- General Company Wide --</option>
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Featured Product <span className="text-[10px] text-slate-400 lowercase">(optional)</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={!selectedSectionId || availableProducts.length === 0}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-40"
              >
                <option value="">-- No specific product --</option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Context Documents Preview Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <FileBox className="h-4 w-4 text-indigo-600" />
                Active Project Context Documents ({activeProject?.contextFiles?.length || 0})
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Strict Project Boundary</span>
            </div>

            {activeProject && activeProject.contextFiles && activeProject.contextFiles.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {activeProject.contextFiles.map((file) => (
                  <span
                    key={file.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-indigo-200/80 text-[11px] font-mono text-indigo-900 shadow-2xs"
                  >
                    <FileCode className="h-3 w-3 text-indigo-500" />
                    {file.fileName}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                No custom context files uploaded for this project yet. The generation will use general company and project descriptions.
              </p>
            )}
          </div>
        </div>

        {/* Step 2: Blog Topic, Title & Custom Instructions */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            2. Blog Topic & Directives
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Blog Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. How Deterministic AI Agent Architectures Transform Enterprise Automation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject Topic / Keyword Theme
            </label>
            <input
              type="text"
              placeholder="e.g. Multi-agent state machines, observability, and sub-millisecond edge runtimes"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Editorial Instructions / Tone Preferences
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Write for Principal Software Architects. Emphasize zero-hallucination tool calling and latency benchmarks. Avoid generic buzzwords."
              value={userInstructions}
              onChange={(e) => setUserInstructions(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3">
          <Link
            href="/blogs"
            className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={generating || !title.trim()}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl bg-linear-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer"
          >
            {generating ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Generating with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Context-Aware Blog
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
