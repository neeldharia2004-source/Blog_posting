import { NextRequest, NextResponse } from "next/server";
import { PublishingService } from "@/services/publishing.service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const retried = await PublishingService.retry(id);
    return NextResponse.json(retried);
  } catch (error: any) {
    console.error("Error retrying publish:", error);
    return NextResponse.json({ error: error.message || "Failed to retry publishing" }, { status: 500 });
  }
}
