import { NextRequest, NextResponse } from "next/server";
import { PublishingService } from "@/services/publishing.service";
import { PublishingPlatform, PublishingStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blogId = searchParams.get("blogId") || undefined;
    const platformParam = searchParams.get("platform") as PublishingPlatform | null;
    const platform = platformParam && Object.values(PublishingPlatform).includes(platformParam) ? platformParam : undefined;
    const statusParam = searchParams.get("status") as PublishingStatus | null;
    const status = statusParam && Object.values(PublishingStatus).includes(statusParam) ? statusParam : undefined;

    const posts = await PublishingService.getAll({ blogId, platform, status });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching published posts:", error);
    return NextResponse.json({ error: "Failed to fetch published posts" }, { status: 500 });
  }
}
