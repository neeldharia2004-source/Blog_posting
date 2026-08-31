import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/services/blog.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const blogs = await BlogService.getAll(projectId);
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error fetching project blogs:", error);
    return NextResponse.json({ error: "Failed to fetch project blogs" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    const { title, topic, content, status } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const created = await BlogService.create(projectId, { title, topic, content, status });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("Error creating blog:", error);
    return NextResponse.json({ error: error.message || "Failed to create blog" }, { status: 500 });
  }
}
