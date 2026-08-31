"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  FolderKanban, 
  FileText, 
  Share2, 
  Sparkles, 
  Plus, 
  Layers, 
  Package, 
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Cpu
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";

interface StatsData {
  counts: {
    companies: number;
    sections: number;
    products: number;
    projects: number;
    contextFiles: number;
    blogs: number;
    publishedPosts: number;
  };
  statusCounts: Record<string, number>;
  recentBlogs: Array<{
    id: string;
    title: string;
    topic: string | null;
    status: string;
    updatedAt: string;
    project: {
      name: string;
      company: { name: string };
    };
    publishedPosts: Array<{
      platform: string;
      status: string;
      url: string | null;
    }>;
  }>;
  recentCompanies: Array<{
    id: string;
    name: string;
    description: string | null;
    _count: {
      sections: number;
      projects: number;
    };
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load stats:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            AI-Powered & Context-Aware
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Multi-Tenant Content & Publishing Engine
          </h1>
          <p className="mt-3 text-sm sm:text-base text-indigo-200 leading-relaxed max-w-2xl">
            Organize company products, maintain isolated project contexts, generate human-like blogs with Gemini AI, and syndicate directly to Blogger and WordPress.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-semibold text-sm hover:bg-indigo-50 transition-all shadow-md hover:scale-[1.02]"
            >
              <Building2 className="h-4 w-4 text-indigo-600" />
              Manage Companies
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-sm border border-indigo-400/40 transition-all"
            >
              <FolderKanban className="h-4 w-4 text-indigo-300" />
              View Projects
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {[
          { label: "Companies", value: stats?.counts.companies, icon: Building2, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Sections", value: stats?.counts.sections, icon: Layers, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Products", value: stats?.counts.products, icon: Package, color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Projects", value: stats?.counts.projects, icon: FolderKanban, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Context Files", value: stats?.counts.contextFiles, icon: Cpu, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Blogs", value: stats?.counts.blogs, icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Published", value: stats?.counts.publishedPosts, icon: Share2, color: "text-teal-600", bg: "bg-teal-50" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex flex-col p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {item.label}
                </span>
                <div className={`p-1.5 rounded-lg ${item.bg} ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {loading ? "..." : item.value ?? 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Grid: Recent Blogs & Active Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Blogs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Blog Activity</h2>
              <p className="text-xs text-slate-500">Latest generated and managed content across all projects</p>
            </div>
            <Link
              href="/blogs"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : stats?.recentBlogs && stats.recentBlogs.length > 0 ? (
            <div className="space-y-3">
              {stats.recentBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={blog.status.toLowerCase() as any}>
                          {blog.status}
                        </Badge>
                        <span className="text-xs font-medium text-slate-400">
                          {blog.project.company.name} / {blog.project.name}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {blog.title}
                      </h3>
                      {blog.topic && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          Topic: {blog.topic}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Syndication Links */}
                  {blog.publishedPosts.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3 text-xs">
                      <span className="font-semibold text-slate-500">Syndicated:</span>
                      {blog.publishedPosts.map((post, pIdx) => (
                        <span key={pIdx} className="inline-flex items-center gap-1 text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="font-medium">{post.platform}</span>
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
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-slate-500 text-xs">
              No blogs generated yet. Create a project to start generating context-aware blogs.
            </div>
          )}
        </div>

        {/* Right 1 Col: Companies & Status Breakdown */}
        <div className="space-y-6">
          {/* Companies Quick Box */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Companies</h2>
              <Link
                href="/companies"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.recentCompanies.map((c) => (
                <Link
                  key={c.id}
                  href={`/companies/${c.id}`}
                  className="block p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all"
                >
                  <div className="font-semibold text-sm text-slate-900">{c.name}</div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>{c._count.sections} Sections</span>
                    <span>•</span>
                    <span>{c._count.projects} Projects</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Approved ER Diagram Hierarchy Guide */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Layers className="h-4 w-4" />
              Hierarchy Architecture
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every content stream is organized strictly following the verified ER model:
            </p>
            <div className="rounded-xl bg-slate-800/80 p-3 text-[11px] font-mono text-indigo-200 space-y-1">
              <div>Company ➔ Sections ➔ Products</div>
              <div>Company ➔ Projects ➔ ContextFiles</div>
              <div>Project ➔ Blogs ➔ PublishedPosts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
