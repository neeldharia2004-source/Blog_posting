import { NextRequest, NextResponse } from "next/server";
import { CompanyService } from "@/services/company.service";
import { companySchema } from "@/lib/validations";

export async function GET() {
  try {
    const companies = await CompanyService.getAll();
    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = companySchema.parse(body);
    const company = await CompanyService.create(validated);
    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Error creating company:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}
