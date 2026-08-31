import { NextResponse } from "next/server";
import { PublisherFactory } from "@/lib/publishing";

export async function GET() {
  try {
    const configs = PublisherFactory.getPlatformConfigs();
    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error checking platform configs:", error);
    return NextResponse.json({ error: "Failed to check platform configurations" }, { status: 500 });
  }
}
