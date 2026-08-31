import { NextRequest, NextResponse } from "next/server";
import { PublishingService } from "@/services/publishing.service";
import { PublishingPlatform } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: blogId } = await params;
    const body = await req.json();
    const { platform } = body;

    if (!platform || !Object.values(PublishingPlatform).includes(platform)) {
      return NextResponse.json(
        { error: "Valid publishing platform (BLOGGER or WORDPRESS) is required." },
        { status: 400 }
      );
    }

    const publishedPost = await PublishingService.publishBlog(blogId, platform);
    return NextResponse.json(publishedPost, { status: 200 });
  } catch (error: any) {
    console.error("Publishing route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to publish blog" },
      { status: 500 }
    );
  }
}
