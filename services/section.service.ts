import { prisma } from "@/lib/prisma";
import { SectionInput } from "@/lib/validations";

export class SectionService {
  static async getByCompanyId(companyId: string) {
    return prisma.section.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
      include: {
        products: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  static async create(companyId: string, data: Omit<SectionInput, "companyId">) {
    return prisma.section.create({
      data: {
        companyId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
      },
      include: {
        products: true,
      },
    });
  }

  static async update(id: string, data: Partial<SectionInput>) {
    return prisma.section.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
      },
      include: {
        products: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.section.delete({
      where: { id },
    });
  }
}
