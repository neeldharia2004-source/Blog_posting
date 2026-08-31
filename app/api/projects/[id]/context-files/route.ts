import { NextRequest, NextResponse } from "next/server";
import { ContextService } from "@/services/context.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const files = await ContextService.getByProjectId(projectId);
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching context files:", error);
    return NextResponse.json({ error: "Failed to fetch context files" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const contentType = req.headers.get("content-type") || "";

    // Case A: Multipart form upload (File)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
      }

      // Check max size: 10MB
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "File size exceeds 10MB limit." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const created = await ContextService.createFromFile(
        projectId,
        buffer,
        file.name,
        file.type
      );

      return NextResponse.json(created, { status: 201 });
    }

    // Case B: Direct Text Note (JSON)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { title, content } = body;

      if (!title || !content) {
        return NextResponse.json(
          { error: "Both title and content are required for direct notes." },
          { status: 400 }
        );
      }

      const created = await ContextService.createFromText(projectId, title, content);
      return NextResponse.json(created, { status: 201 });
    }

    return NextResponse.json(
      { error: "Unsupported Content-Type. Send multipart/form-data or application/json." },
      { status: 415 }
    );
  } catch (error: any) {
    console.error("Error creating context file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process context file." },
      { status: 500 }
    );
  }
}
