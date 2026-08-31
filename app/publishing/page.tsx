import { Share2, CheckCircle2, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function PublishingPage() {
  const publishedPosts = await prisma.publishedPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      blog: {
        include: {
          project: {
            include: {
              company: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Publishing & Multi-Platform Syndication
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Track published blogs across connected platforms (Blogger & WordPress).
        </p>
      </div>

      <div className="space-y-4">
        {publishedPosts.map((post) => (
          <div
            key={post.id}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant={post.status === "PUBLISHED" ? "success" : "draft"}>
                  {post.platform} • {post.status}
                </Badge>
                <span className="text-xs text-slate-400">
                  {post.blog.project.company.name} / {post.blog.project.name}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{post.blog.title}</h3>
              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 font-mono"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {post.url}
                </a>
              )}
            </div>

            <div className="text-right text-[11px] text-slate-400">
              {post.publishedAt ? `Published: ${new Date(post.publishedAt).toLocaleDateString()}` : "Status: Pending"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
