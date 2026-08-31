import { prisma } from "@/lib/prisma";
import { CompanyInput } from "@/lib/validations";

export class CompanyService {
  static async getAll() {
    return prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            sections: true,
            projects: true,
          },
        },
      },
    });
  }

  static async getById(id: string) {
    return prisma.company.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { createdAt: "asc" },
          include: {
            products: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
        projects: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: {
                contextFiles: true,
                blogs: true,
              },
            },
          },
        },
      },
    });
  }

  static async create(data: CompanyInput) {
    return prisma.company.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
      },
    });
  }

  static async update(id: string, data: Partial<CompanyInput>) {
    return prisma.company.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
      },
    });
  }

  static async delete(id: string) {
    return prisma.company.delete({
      where: { id },
    });
  }
}
