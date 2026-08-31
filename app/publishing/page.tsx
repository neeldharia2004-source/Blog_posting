"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Share2, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  ExternalLink, 
  FileText, 
  Building2, 
  FolderKanban, 
  Send,
  HelpCircle,
  Clock,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Modal } from "@/components/ui/Modal";

interface PlatformConfigStatus {
  platform: string;
  name: string;
  isConfigured: boolean;
  missingFields: string[];
  description: string;
}

interface BlogItem {
  id: string;
  title: string;
  topic: string | null;
  status: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    company: {
      id: string;
      name: string;
    };
  };
  publishedPosts: {
    id: string;
    platform: string;
    status: string;
    url: string | null;
  }[];
}

interface PublishedPostDetail {
  id: string;
  platform: string;
  status: string;
  url: string | null;
  externalPostId: string | null;
  publishedAt: string | null;
  updatedAt: string;
  blog: {
    id: string;
    title: string;
    project: {
      id: string;
      name: string;
      company: {
        id: string;
        name: string;
      };
    };
  };
}

export default function PublishingPage() {
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfigStatus[]>([]);
  const [approvedBlogs, setApprovedBlogs] = useState<BlogItem[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<PublishedPostDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Publish Modal State
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);
  const [targetPlatform, setTargetPlatform] = useState<"BLOGGER" | "WORDPRESS">("BLOGGER");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [publishSuccess, setPublishSuccess] = useState<any>(null);

  // Retry state
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [configsRes, blogsRes, postsRes] = await Promise.all([
        fetch("/api/publishing/status"),
        fetch("/api/blogs"),
        fetch("/api/published-posts"),
      ]);

      const [configs, allBlogs, posts] = await Promise.all([
        configsRes.json(),
        blogsRes.json(),
        postsRes.json(),
      ]);

      setPlatformConfigs(configs);
      setPublishedPosts(posts);

      // Filter blogs that are APPROVED or already PUBLISHED (for multi-channel publishing)
      const eligible = allBlogs.filter((b: BlogItem) => b.status === "APPROVED" || b.status === "PUBLISHED");
      setApprovedBlogs(eligible);
    } catch (err) {
      console.error("Error loading publishing hub data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPublishModal = (blog: BlogItem) => {
    setSelectedBlog(blog);
    setPublishError("");
    setPublishSuccess(null);
    setPublishModalOpen(true);
  };

  const handlePublish = async () => {
    if (!selectedBlog) return;

    setPublishing(true);
    setPublishError("");
    setPublishSuccess(null);

    try {
      const res = await fetch(`/api/blogs/${selectedBlog.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: targetPlatform }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Publishing to ${targetPlatform} failed.`);
      }

      setPublishSuccess(data);
      fetchData();
    } catch (err: any) {
      setPublishError(err.message || "Failed to publish blog.");
    } finally {
      setPublishing(false);
    }
  };

  const handleRetry = async (postId: string) => {
    setRetryingId(postId);
    try {
      const res = await fetch(`/api/published-posts/${postId}/retry`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Retry failed");
      fetchData();
    } catch (err: any) {
      alert(`Retry Failed: ${err.message}`);
    } finally {
      setRetryingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Multi-Platform Publishing Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Syndicate approved, context-grounded blogs to Google Blogger and WordPress with live permalink tracking.
        </p>
      </div>

      {/* 1. Platform Connection Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platformConfigs.map((cfg) => (
          <div
            key={cfg.platform}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{cfg.name}</h2>
                  <p className="text-[11px] text-slate-400 font-mono">Platform: {cfg.platform}</p>
                </div>
              </div>

              {cfg.isConfigured ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" /> Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                  <ShieldAlert className="h-3.5 w-3.5" /> Setup Required
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{cfg.description}</p>

            {!cfg.isConfigured && (
              <div className="p-3 rounded-xl bg-slate-50 text-[11px] font-mono text-slate-600 space-y-1">
                <div className="font-semibold text-slate-700">Missing in .env:</div>
                {cfg.missingFields.map((f, i) => (
                  <div key={i} className="text-amber-800">• {f}</div>
                ))}
              </div>
            )}

            {cfg.platform === "BLOGGER" && (
              <a
                href="/api/auth/blogger"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.01]"
              >
                {cfg.isConfigured ? "Re-Authorize Google Blogger" : "Authorize Google Blogger (1-Click)"}
              </a>
            )}
          </div>
        ))}
      </div>

      {/* 2. Approved Blogs Ready for Syndication */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Approved Blogs Ready to Publish ({approvedBlogs.length})
            </h2>
            <p className="text-xs text-slate-500">
              Blogs that have undergone editorial review and are ready for multi-channel distribution.
            </p>
          </div>
        </div>

        {approvedBlogs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {approvedBlogs.map((b) => (
              <div
                key={b.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={b.status === "PUBLISHED" ? "success" : "approved"}>
                      {b.status}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-400">
                      {b.project.company.name} • {b.project.name}
                    </span>
                  </div>

                  <Link href={`/blogs/${b.id}`} className="block">
                    <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                      {b.title}
                    </h3>
                  </Link>

                  {b.topic && (
                    <p className="text-xs text-slate-500 line-clamp-1">Topic: {b.topic}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Updated {new Date(b.updatedAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => openPublishModal(b)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" /> Publish Blog
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText className="h-8 w-8 text-slate-400" />}
            title="No approved blogs available"
            description="Generate a context-aware blog and approve it in the Blog Editor to enable publishing."
            action={
              <Link
                href="/blogs/generate"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Generate Blog
              </Link>
            }
          />
        )}
      </div>

      {/* 3. Published Posts Feed */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Syndicated Posts Feed ({publishedPosts.length})
        </h2>

        {publishedPosts.length > 0 ? (
          <div className="overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Blog & Context</th>
                    <th className="px-4 py-3.5">Platform</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Live Permalink</th>
                    <th className="px-4 py-3.5">Published At</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {publishedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 max-w-xs">
                        <Link
                          href={`/blogs/${post.blog.id}`}
                          className="font-bold hover:text-indigo-600 transition-colors line-clamp-1"
                        >
                          {post.blog.title}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {post.blog.project.company.name} / {post.blog.project.name}
                        </div>
                      </td>

                      <td className="px-4 py-4 font-bold text-slate-800">
                        {post.platform}
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            post.status === "PUBLISHED"
                              ? "success"
                              : post.status === "FAILED"
                              ? "failed"
                              : "draft"
                          }
                        >
                          {post.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        {post.url ? (
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-mono text-[11px] max-w-[200px] truncate"
                          >
                            {post.url} <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleString()
                          : "—"}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {post.status === "FAILED" ? (
                          <button
                            onClick={() => handleRetry(post.id)}
                            disabled={retryingId === post.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <RotateCw className={`h-3 w-3 ${retryingId === post.id ? "animate-spin" : ""}`} />
                            Retry
                          </button>
                        ) : (
                          <Link
                            href={`/blogs/${post.blog.id}`}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Globe className="h-8 w-8 text-slate-400" />}
            title="No published posts yet"
            description="Publish your approved blogs to see live syndication records and permalinks."
          />
        )}
      </div>

      {/* Publish Modal */}
      <Modal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        title="Syndicate Blog to External Platform"
        description="Select the destination platform to publish the approved markdown post."
      >
        <div className="space-y-5">
          {selectedBlog && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Selected Blog Post
              </span>
              <h4 className="text-sm font-bold text-slate-900">{selectedBlog.title}</h4>
              <p className="text-xs text-slate-500">
                {selectedBlog.project.company.name} • {selectedBlog.project.name}
              </p>
            </div>
          )}

          {/* Platform Selector Tabs */}
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
                <div className="text-[11px] text-slate-500 mt-0.5">REST API v2 Application Passwords</div>
              </button>
            </div>
          </div>

          {/* Result / Error Banner */}
          {publishError && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Publishing Error</span>
                <span>{publishError}</span>
              </div>
            </div>
          )}

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

          {/* Action Buttons */}
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
    </div>
  );
}
