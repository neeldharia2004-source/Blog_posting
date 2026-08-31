import { prisma } from "@/lib/prisma";
import { BlogStatus } from "@prisma/client";
import { ContextBuilder } from "@/lib/context/context-builder";
import { getAIProvider } from "@/lib/ai";

export interface GenerateBlogInput {
  title: string;
  topic?: string | null;
  userInstructions?: string | null;
  sectionId?: string | null;
  productId?: string | null;
}

export class BlogService {
  static async getAll(projectId?: string, status?: BlogStatus) {
    return prisma.blog.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        project: {
          include: {
            company: {
              select: { id: true, name: true },
            },
          },
        },
        publishedPosts: true,
      },
    });
  }

  static async getById(id: string) {
    return prisma.blog.findUnique({
      where: { id },
      include: {
        project: {
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
              select: {
                id: true,
                fileName: true,
                fileType: true,
              },
            },
          },
        },
        publishedPosts: true,
      },
    });
  }

  static async create(
    projectId: string,
    data: { title: string; topic?: string | null; content: string; status?: BlogStatus }
  ) {
    return prisma.blog.create({
      data: {
        projectId,
        title: data.title.trim(),
        topic: data.topic?.trim() || null,
        content: data.content,
        status: data.status || BlogStatus.DRAFT,
      },
      include: {
        project: {
          include: { company: true },
        },
        publishedPosts: true,
      },
    });
  }

  static async update(
    id: string,
    data: Partial<{
      title: string;
      topic: string | null;
      content: string;
      status: BlogStatus;
    }>
  ) {
    return prisma.blog.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.topic !== undefined && { topic: data.topic ? data.topic.trim() : null }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        project: {
          include: { company: true },
        },
        publishedPosts: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.blog.delete({
      where: { id },
    });
  }

  /**
   * Complete context-aware generation pipeline:
   * 1. Creates Blog record in GENERATING status
   * 2. Builds context from Company, Section, Product, Project & ContextFiles
   * 3. Sends prompt to AIProvider (Gemini)
   * 4. Updates Blog to GENERATED with markdown content
   */
  static async generate(projectId: string, input: GenerateBlogInput) {
    const { title, topic, userInstructions, sectionId, productId } = input;

    if (!title || !title.trim()) {
      throw new Error("Blog title is required.");
    }

    // Step 1: Create initial placeholder blog with GENERATING status
    const initialBlog = await prisma.blog.create({
      data: {
        projectId,
        title: title.trim(),
        topic: topic?.trim() || null,
        status: BlogStatus.GENERATING,
        content: "Generating context-aware blog content with Gemini AI...",
      },
    });

    try {
      // Step 2: Build Structured Context
      const structuredContext = await ContextBuilder.buildContext({
        projectId,
        sectionId,
        productId,
      });

      // Step 3: Call AI Provider
      const provider = getAIProvider();
      const result = await provider.generateBlog({
        title: title.trim(),
        topic: topic?.trim() || null,
        structuredContext,
        userInstructions: userInstructions?.trim() || null,
      });

      // Step 4: Update Blog to GENERATED with result
      return await prisma.blog.update({
        where: { id: initialBlog.id },
        data: {
          content: result.content,
          status: BlogStatus.GENERATED,
        },
        include: {
          project: {
            include: { company: true },
          },
          publishedPosts: true,
        },
      });
    } catch (error: any) {
      console.error("Blog generation failed:", error);
      // Mark as FAILED if error occurs
      await prisma.blog.update({
        where: { id: initialBlog.id },
        data: {
          status: BlogStatus.FAILED,
          content: `Generation Failed: ${error.message || "Unknown error occurred"}`,
        },
      });
      throw error;
    }
  }
}
