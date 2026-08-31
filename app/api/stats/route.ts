import { NextResponse } from "next/server";
import { StatsService } from "@/services/stats.service";

export async function GET() {
  try {
    const stats = await StatsService.getOverviewStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 });
  }
}
