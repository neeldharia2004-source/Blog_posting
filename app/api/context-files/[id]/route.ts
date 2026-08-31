import { NextRequest, NextResponse } from "next/server";
import { ContextService } from "@/services/context.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const file = await ContextService.getById(id);
    if (!file) {
      return NextResponse.json({ error: "Context file not found" }, { status: 404 });
    }
    return NextResponse.json(file);
  } catch (error) {
    console.error("Error fetching context file:", error);
    return NextResponse.json({ error: "Failed to fetch context file" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ContextService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting context file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete context file" },
      { status: 500 }
    );
  }
}
