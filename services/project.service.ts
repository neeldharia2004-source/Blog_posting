import { prisma } from "@/lib/prisma";
import { ProjectInput } from "@/lib/validations";

export class ProjectService {
  static async getAll(companyId?: string) {
    return prisma.project.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            contextFiles: true,
            blogs: true,
          },
        },
      },
    });
  }

  static async getById(id: string) {
    return prisma.project.findUnique({
      where: { id },
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
        blogs: {
          orderBy: { createdAt: "desc" },
          include: {
            publishedPosts: true,
          },
        },
      },
    });
  }

  static async create(companyId: string, data: Omit<ProjectInput, "companyId">) {
    return prisma.project.create({
      data: {
        companyId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
      },
      include: {
        company: true,
      },
    });
  }

  static async update(id: string, data: Partial<ProjectInput>) {
    return prisma.project.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
      },
      include: {
        company: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }
}
