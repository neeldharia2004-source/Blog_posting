import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/services/blog.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    const { title, topic, userInstructions, sectionId, productId } = body;

    if (!title) {
      return NextResponse.json({ error: "Blog title is required." }, { status: 400 });
    }

    const blog = await BlogService.generate(projectId, {
      title,
      topic,
      userInstructions,
      sectionId,
      productId,
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    console.error("Error in blog generation handler:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate context-aware blog" },
      { status: 500 }
    );
  }
}
