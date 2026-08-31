import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/services/blog.service";
import { BlogStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;
    const statusParam = searchParams.get("status") as BlogStatus | null;
    const status = statusParam && Object.values(BlogStatus).includes(statusParam) ? statusParam : undefined;

    const blogs = await BlogService.getAll(projectId, status);
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}
