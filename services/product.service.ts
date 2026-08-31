import { prisma } from "@/lib/prisma";
import { ProductInput } from "@/lib/validations";

export class ProductService {
  static async getBySectionId(sectionId: string) {
    return prisma.product.findMany({
      where: { sectionId },
      orderBy: { createdAt: "asc" },
    });
  }

  static async create(sectionId: string, data: Omit<ProductInput, "sectionId">) {
    return prisma.product.create({
      data: {
        sectionId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
      },
    });
  }

  static async update(id: string, data: Partial<ProductInput>) {
    return prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
      },
    });
  }

  static async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }
}
