import { prisma } from "@/lib/prisma";
import { BlogStatus, PublishingPlatform, PublishingStatus } from "@prisma/client";
import { PublisherFactory } from "@/lib/publishing";

export class PublishingService {
  /**
   * Returns list of all published post records with blog, project, and company relations.
   */
  static async getAll(filters?: {
    blogId?: string;
    platform?: PublishingPlatform;
    status?: PublishingStatus;
  }) {
    return prisma.publishedPost.findMany({
      where: {
        ...(filters?.blogId ? { blogId: filters.blogId } : {}),
        ...(filters?.platform ? { platform: filters.platform } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: {
        blog: {
          include: {
            project: {
              include: {
                company: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });
  }

  static async getById(id: string) {
    return prisma.publishedPost.findUnique({
      where: { id },
      include: {
        blog: {
          include: {
            project: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Main publishing workflow:
   * 1. Validates Blog exists and is in APPROVED or PUBLISHED status
   * 2. Sets PublishedPost record status to PUBLISHING
   * 3. Calls platform publisher (Blogger or WordPress)
   * 4. Updates record to PUBLISHED (with live URL and external post ID) or FAILED
   */
  static async publishBlog(blogId: string, platform: PublishingPlatform) {
    // 1. Fetch and Validate Blog Status
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        project: {
          include: { company: true },
        },
      },
    });

    if (!blog) {
      throw new Error(`Blog with ID ${blogId} not found.`);
    }

    if (blog.status !== BlogStatus.APPROVED && blog.status !== BlogStatus.PUBLISHED) {
      throw new Error(
        `Only approved blogs can be published. Current status is '${blog.status}'. Please approve the blog first.`
      );
    }

    // 2. Find or create the PublishedPost record in PUBLISHING status
    let postRecord = await prisma.publishedPost.findFirst({
      where: {
        blogId,
        platform,
      },
    });

    if (postRecord) {
      postRecord = await prisma.publishedPost.update({
        where: { id: postRecord.id },
        data: {
          status: PublishingStatus.PUBLISHING,
        },
      });
    } else {
      postRecord = await prisma.publishedPost.create({
        data: {
          blogId,
          platform,
          status: PublishingStatus.PUBLISHING,
        },
      });
    }

    // 3. Delegate to Publisher Factory
    const publisher = PublisherFactory.getPublisher(platform);
    const result = await publisher.publish({
      title: blog.title,
      content: blog.content,
      topic: blog.topic,
    });

    // 4. Update status according to result
    if (result.success) {
      const updatedPost = await prisma.publishedPost.update({
        where: { id: postRecord.id },
        data: {
          status: PublishingStatus.PUBLISHED,
          url: result.url || null,
          externalPostId: result.externalPostId || null,
          publishedAt: new Date(),
        },
        include: {
          blog: true,
        },
      });

      // Update parent blog status to PUBLISHED
      await prisma.blog.update({
        where: { id: blogId },
        data: {
          status: BlogStatus.PUBLISHED,
        },
      });

      return updatedPost;
    } else {
      // Mark as FAILED with error
      const failedPost = await prisma.publishedPost.update({
        where: { id: postRecord.id },
        data: {
          status: PublishingStatus.FAILED,
        },
        include: {
          blog: true,
        },
      });

      throw new Error(result.error || `Publishing to ${platform} failed.`);
    }
  }

  /**
   * Retries publishing for an existing PublishedPost record
   */
  static async retry(publishedPostId: string) {
    const record = await prisma.publishedPost.findUnique({
      where: { id: publishedPostId },
    });

    if (!record) {
      throw new Error(`Published post record ${publishedPostId} not found.`);
    }

    return this.publishBlog(record.blogId, record.platform);
  }
}
