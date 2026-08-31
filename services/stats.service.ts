import { prisma } from "@/lib/prisma";

export class StatsService {
  static async getOverviewStats() {
    const [
      companyCount,
      sectionCount,
      productCount,
      projectCount,
      contextFileCount,
      blogCount,
      publishedPostCount,
      recentBlogs,
      recentCompanies,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.section.count(),
      prisma.product.count(),
      prisma.project.count(),
      prisma.contextFile.count(),
      prisma.blog.count(),
      prisma.publishedPost.count(),
      prisma.blog.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: {
          project: {
            include: {
              company: {
                select: { name: true },
              },
            },
          },
          publishedPosts: true,
        },
      }),
      prisma.company.findMany({
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              sections: true,
              projects: true,
            },
          },
        },
      }),
    ]);

    const blogsByStatus = await prisma.blog.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const statusCounts = blogsByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      counts: {
        companies: companyCount,
        sections: sectionCount,
        products: productCount,
        projects: projectCount,
        contextFiles: contextFileCount,
        blogs: blogCount,
        publishedPosts: publishedPostCount,
      },
      statusCounts,
      recentBlogs,
      recentCompanies,
    };
  }
}
