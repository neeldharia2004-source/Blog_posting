import { NextRequest, NextResponse } from "next/server";
import { ProjectService } from "@/services/project.service";
import { projectSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const projects = await ProjectService.getAll(companyId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching company projects:", error);
    return NextResponse.json({ error: "Failed to fetch company projects" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const body = await req.json();
    const validated = projectSchema.omit({ companyId: true }).parse(body);
    const project = await ProjectService.create(companyId, validated);
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
