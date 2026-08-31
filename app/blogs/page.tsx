"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  Share2, 
  CheckCircle2, 
  ExternalLink,
  Clock,
  Layers,
  FolderKanban
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";

interface PublishedPost {
  id: string;
  platform: string;
  status: string;
  url: string | null;
}

interface Blog {
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

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const statuses = ["ALL", "DRAFT", "GENERATED", "APPROVED", "PUBLISHED", "FAILED"];

  const filteredBlogs = blogs.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status.toUpperCase() === statusFilter;
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.topic && b.topic.toLowerCase().includes(search.toLowerCase())) ||
      b.project.name.toLowerCase().includes(search.toLowerCase()) ||
      b.project.company.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Blogs Repository
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            All AI-generated, reviewed, and published blogs grounded in your company knowledge.
          </p>
        </div>

        <Link
          href="/blogs/generate"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          Generate New Blog
        </Link>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search blogs by title, topic, company, or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === s
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards List */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className="space-y-4">
          {filteredBlogs.map((b) => {
            const wordCount = b.content.split(/\s+/).filter(Boolean).length;
            const readTime = Math.max(1, Math.round(wordCount / 200));

            return (
              <div
                key={b.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={b.status.toLowerCase() as any}>{b.status}</Badge>
                      <Link
                        href={`/companies/${b.project.company.id}`}
                        className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {b.project.company.name}
                      </Link>
                      <span className="text-slate-300">•</span>
                      <Link
                        href={`/projects/${b.project.id}`}
                        className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                      >
                        {b.project.name}
                      </Link>
                    </div>

                    <Link href={`/blogs/${b.id}`} className="block">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {b.title}
                      </h3>
                    </Link>

                    {b.topic && (
                      <p className="text-xs text-slate-500 line-clamp-1">
                        Topic: {b.topic}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/blogs/${b.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-bold transition-all shrink-0 border border-slate-100 group-hover:border-indigo-200"
                  >
                    Open Editor <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                  {b.content.replace(/^#+\s+/gm, "").slice(0, 240)}...
                </p>

                {/* Footer stats & Syndication status */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> {wordCount} words
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> ~{readTime} min read
                    </span>
                    <span>•</span>
                    <span>Updated {new Date(b.updatedAt).toLocaleDateString()}</span>
                  </div>

                  {b.publishedPosts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-500">Syndicated:</span>
                      {b.publishedPosts.map((post, pIdx) => (
                        <span key={pIdx} className="inline-flex items-center gap-1 text-slate-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          {post.platform}
                          {post.url && (
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline inline-flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 ml-0.5" />
                            </a>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="h-10 w-10 text-slate-400" />}
          title="No blogs match your filter"
          description="Generate your first context-aware blog with Gemini AI."
          action={
            <Link
              href="/blogs/generate"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-200"
            >
              <Sparkles className="h-4 w-4" />
              Generate Blog
            </Link>
          }
        />
      )}
    </div>
  );
}
