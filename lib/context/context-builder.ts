import { prisma } from "@/lib/prisma";

export interface ContextBuilderOptions {
  projectId: string;
  sectionId?: string | null;
  productId?: string | null;
}

export class ContextBuilder {
  /**
   * Compiles all relevant context across Company, Section, Product, Project, and ContextFiles
   * into a formatted, structured prompt block.
   */
  static async buildContext(options: ContextBuilderOptions): Promise<string> {
    const { projectId, sectionId, productId } = options;

    // 1. Fetch Project with Company, Sections, Products, and ContextFiles
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        company: {
          include: {
            sections: {
              include: {
                products: true,
              },
            },
          },
        },
        contextFiles: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    const company = project.company;

    // 2. Resolve optional Section and Product if specified
    let selectedSection = null;
    let selectedProduct = null;

    if (sectionId) {
      selectedSection = company.sections.find((s) => s.id === sectionId) || null;
    }
    if (productId) {
      for (const s of company.sections) {
        const found = s.products.find((p) => p.id === productId);
        if (found) {
          selectedProduct = found;
          if (!selectedSection) selectedSection = s;
          break;
        }
      }
    }

    // 3. Assemble Structured Context String
    const sections: string[] = [];

    sections.push("==================================================");
    sections.push("KNOWLEDGE BASE & CONTEXTUAL GROUNDING:");
    sections.push("==================================================");

    // A. Company Context
    sections.push(`\n[COMPANY INFORMATION]`);
    sections.push(`Company Name: ${company.name}`);
    if (company.description) {
      sections.push(`Company Overview: ${company.description}`);
    }

    // B. Relevant Section / Department Context
    if (selectedSection) {
      sections.push(`\n[BUSINESS SECTION]`);
      sections.push(`Section: ${selectedSection.name}`);
      if (selectedSection.description) {
        sections.push(`Section Overview: ${selectedSection.description}`);
      }
    }

    // C. Relevant Product Context
    if (selectedProduct) {
      sections.push(`\n[FEATURED PRODUCT]`);
      sections.push(`Product Name: ${selectedProduct.name}`);
      if (selectedProduct.description) {
        sections.push(`Product Capabilities: ${selectedProduct.description}`);
      }
    }

    // D. Project Context
    sections.push(`\n[PROJECT & CAMPAIGN DETAILS]`);
    sections.push(`Project Name: ${project.name}`);
    if (project.description) {
      sections.push(`Project Mission / Scope: ${project.description}`);
    }

    // E. Attached Context Documents (Brand guides, technical specs, whitepapers)
    if (project.contextFiles.length > 0) {
      sections.push(`\n[PROJECT CONTEXT DOCUMENTS (${project.contextFiles.length} files)]`);
      project.contextFiles.forEach((file, index) => {
        sections.push(`\n--- Document ${index + 1}: ${file.fileName} (${file.fileType}) ---`);
        sections.push(file.extractedContent.trim());
      });
    } else {
      sections.push(`\n[PROJECT CONTEXT DOCUMENTS]`);
      sections.push(`No additional context files uploaded for this project.`);
    }

    return sections.join("\n");
  }
}
