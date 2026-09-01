"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  ArrowLeft, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  RotateCw, 
  Trash2, 
  Eye, 
  Code, 
  Clock, 
  Share2, 
  ExternalLink,
  AlertCircle,
  Building2,
  FolderKanban,
  Check,
  Send,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { SEOAnalyzer } from "@/components/SEOAnalyzer";
import { Modal } from "@/components/ui/Modal";

interface PublishedPost {
  id: string;
  platform: string;
  status: string;
  url: string | null;
}

interface BlogDetail {
  id: string;
  title: string;
  topic: string | null;
  status: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    company: {
      id: string;
      name: string;
    };
  };
  publishedPosts: PublishedPost[];
}

export default function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable Form State
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string>("DRAFT");

  // Editor View Mode
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split" | "seo">("split");

  // Action states
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Publishing Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [targetPlatform, setTargetPlatform] = useState<"BLOGGER" | "WORDPRESS">("BLOGGER");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [publishSuccess, setPublishSuccess] = useState<any>(null);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/blogs/${id}`);
      if (!res.ok) {
        if (res.status === 404) router.push("/blogs");
        return;
      }
      const data = await res.json();
      setBlog(data);
      setTitle(data.title);
      setTopic(data.topic || "");
      setContent(data.content);
      setStatus(data.status);
    } catch (err) {
      console.error("Error fetching blog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const handleSave = async (newStatus?: string) => {
    if (!title.trim()) {
      setFeedback({ type: "error", message: "Blog title is required." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const targetStatus = newStatus || status;

    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          topic: topic.trim() || null,
          content,
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update blog");

      setStatus(targetStatus);
      setFeedback({
        type: "success",
        message:
          targetStatus === "APPROVED"
            ? "Blog successfully approved for publishing!"
            : "Draft saved successfully.",
      });

      setTimeout(() => setFeedback(null), 4000);
      fetchBlog();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to save blog." });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!blog) return;
    setRegenerating(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/projects/${blog.project.id}/blogs/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          topic: topic.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to regenerate");

      // Update content and status with regenerated output
      setContent(data.content);
      setStatus(data.status);
      setFeedback({ type: "success", message: "Blog regenerated successfully with Gemini AI!" });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Regeneration failed." });
    } finally {
      setRegenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!blog) return;
    setPublishing(true);
    setPublishError("");
    setPublishSuccess(null);

    try {
      const res = await fetch(`/api/blogs/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: targetPlatform }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Publishing to ${targetPlatform} failed.`);
      }

      setPublishSuccess(data);
      setStatus("PUBLISHED");
      fetchBlog();
    } catch (err: any) {
      setPublishError(err.message || "Failed to publish blog.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete blog");
      router.push("/blogs");
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleting(false);
    }
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Metadata Bar */}
      <div>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Blogs
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={status.toLowerCase() as any}>{status}</Badge>
              <Link
                href={`/companies/${blog.project.company.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                {blog.project.company.name}
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href={`/projects/${blog.project.id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <FolderKanban className="h-3.5 w-3.5 text-slate-400" />
                {blog.project.name}
              </Link>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-slate-400" /> {wordCount} words
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> ~{readTime} min read
              </span>
              <span>•</span>
              <span>Updated {new Date(blog.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleRegenerate}
              disabled={regenerating || saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin text-indigo-600" : ""}`} />
              {regenerating ? "Regenerating..." : "Regenerate"}
            </button>

            <button
              onClick={() => handleSave("DRAFT")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              Save Draft
            </button>

            <button
              onClick={() => handleSave("APPROVED")}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve Blog
            </button>

            {(status === "APPROVED" || status === "PUBLISHED") && (
              <button
                onClick={() => {
                  setPublishError("");
                  setPublishSuccess(null);
                  setPublishModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                Publish Blog
              </button>
            )}

            <button
              onClick={() => setDeleteDialogOpen(true)}
              title="Delete blog"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 p-4 rounded-2xl text-xs border animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Title & Topic Inputs */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Blog Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Topic / Subject Theme
          </label>
          <input
            type="text"
            value={topic}
            placeholder="e.g. Enterprise AI Agent Orchestration and Observability"
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        {/* Workspace Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
          <h2 className="text-sm font-bold text-slate-900">Blog Markdown Content</h2>

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              onClick={() => setViewMode("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "edit"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Code className="h-3.5 w-3.5" /> Markdown Editor
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "preview"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="h-3.5 w-3.5" /> Formatted Preview
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "split"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode("seo")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "seo"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-indigo-600" /> SEO & Quality Audit
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SEO & Quality Analyzer View */}
          {viewMode === "seo" && (
            <div className="md:col-span-2">
              <SEOAnalyzer
                title={title}
                topic={topic}
                content={content}
                companyName={blog.project.company.name}
                blogId={blog.id}
              />
            </div>
          )}

          {/* Raw Markdown Editor */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div className={`space-y-2 ${viewMode === "edit" ? "md:col-span-2" : ""}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Raw Markdown Input
              </span>
              <textarea
                rows={22}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 leading-relaxed resize-y"
              />
            </div>
          )}

          {/* Rendered Preview */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className={`space-y-2 ${viewMode === "preview" ? "md:col-span-2" : ""}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Rendered Article Preview
              </span>
              <div className="p-8 rounded-2xl border border-slate-200 bg-white min-h-[500px] max-h-[650px] overflow-y-auto shadow-xs">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Syndication Status Footer */}
      {blog.publishedPosts.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Share2 className="h-4 w-4 text-teal-600" />
            Publishing & Syndication Details
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {blog.publishedPosts.map((post) => (
              <div key={post.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <Badge variant={post.status === "PUBLISHED" ? "success" : "draft"}>
                    {post.platform} • {post.status}
                  </Badge>
                  {post.url && (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-xs text-indigo-600 hover:underline font-mono"
                    >
                      {post.url}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish Modal */}
      <Modal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        title="Publish Blog Post"
        description="Select the destination platform to publish the approved markdown post."
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Selected Blog Post
            </span>
            <h4 className="text-sm font-bold text-slate-900">{blog.title}</h4>
            <p className="text-xs text-slate-500">
              {blog.project.company.name} • {blog.project.name}
            </p>
          </div>

          {/* Platform Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Destination Platform
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetPlatform("BLOGGER")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  targetPlatform === "BLOGGER"
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Google Blogger</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Blogger v3 REST API</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetPlatform("WORDPRESS")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  targetPlatform === "WORDPRESS"
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="font-bold text-xs text-slate-900">WordPress</div>
                <div className="text-[11px] text-slate-500 mt-0.5">REST API v2 App Passwords</div>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {publishError && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Publishing Error</span>
                <span>{publishError}</span>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {publishSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Successfully published to {targetPlatform}!
              </div>
              {publishSuccess.url && (
                <a
                  href={publishSuccess.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-700 underline font-mono text-xs font-semibold"
                >
                  View Live Post <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPublishModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              {publishing ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Publish Now
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Blog"
        message={`Are you sure you want to delete "${blog.title}"? This cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  );
}
