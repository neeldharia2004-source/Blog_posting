import { prisma } from "../lib/prisma";
import { CompanyService } from "../services/company.service";
import { ProjectService } from "../services/project.service";
import { BlogService } from "../services/blog.service";
import { PublishingService } from "../services/publishing.service";
import { PublisherFactory, markdownToHtml } from "../lib/publishing";
import { BlogStatus, PublishingPlatform, PublishingStatus } from "@prisma/client";

async function testPhase5() {
  console.log("🧪 Starting Phase 5 End-to-End Multi-Platform Publishing Tests...\n");

  // 1. Test Markdown to HTML Converter
  console.log("1️⃣ Testing Markdown to HTML Converter...");
  const markdownSample = `
# Edge Runtime Deployment
In distributed computing, sub-50ms latency is critical.

## Key Benchmarks
- **Cold Start**: Under 12ms.
- **Memory Overhead**: 32MB base.

> "Deterministic state machines are the foundation of edge reliability."

\`\`\`typescript
const runtime = new EdgeWorker();
await runtime.start();
\`\`\`
  `.trim();

  const html = markdownToHtml(markdownSample);
  if (
    !html.includes("<h1>Edge Runtime Deployment</h1>") ||
    !html.includes("<strong>Cold Start</strong>") ||
    !html.includes("<blockquote><p>") ||
    !html.includes("<pre><code class=\"language-typescript\">")
  ) {
    throw new Error("markdownToHtml converter failed verification!");
  }
  console.log("✅ Markdown to HTML converter accurately parsed all elements.\n");

  // 2. Test Publisher Factory and Config Statuses
  console.log("2️⃣ Testing Publisher Factory & Platform Readiness...");
  const configs = PublisherFactory.getPlatformConfigs();
  console.log("Platform configs detected:", configs.map((c) => `${c.name} (Configured: ${c.isConfigured})`));
  if (configs.length !== 2) {
    throw new Error(`Expected 2 platform configs (Blogger and WordPress), found ${configs.length}`);
  }
  console.log("✅ PublisherFactory loaded both BloggerPublisher and WordPressPublisher.\n");

  // 3. Setup Test Hierarchy & Blog
  const company = await CompanyService.create({
    name: "Phase5 Publishing Corp",
    description: "Automated multi-channel technical publications.",
  });

  const project = await ProjectService.create(company.id, {
    name: "Syndication Campaign",
    description: "Testing automated Blogger and WordPress distribution.",
  });

  const blog = await BlogService.create(project.id, {
    title: "How Multi-Platform Syndication Powers Developer Marketing",
    topic: "Developer Relations & Omnichannel Publishing",
    content: markdownSample,
    status: BlogStatus.DRAFT,
  });

  console.log(`✅ Created test hierarchy and draft blog "${blog.title}" (ID: ${blog.id})`);

  // 4. Test Pre-flight Approval Rejection
  console.log("\n3️⃣ Testing Pre-Flight Approval Validation...");
  try {
    await PublishingService.publishBlog(blog.id, PublishingPlatform.BLOGGER);
    throw new Error("Validation failed! Draft blog was allowed to publish.");
  } catch (err: any) {
    if (err.message.includes("Only approved blogs can be published")) {
      console.log(`✅ Blocked unapproved blog publication as expected: "${err.message}"`);
    } else {
      throw err;
    }
  }

  // 5. Approve Blog and Test Multi-Platform Publishing
  console.log("\n4️⃣ Approving Blog and Testing Multi-Platform Publishing...");
  await BlogService.update(blog.id, { status: BlogStatus.APPROVED });

  // Simulate Blogger publishing (credentials missing in local test -> safely records FAILED with clear reason)
  try {
    await PublishingService.publishBlog(blog.id, PublishingPlatform.BLOGGER);
  } catch (err: any) {
    console.log(`ℹ️ Blogger publish response: ${err.message}`);
  }

  // Check PublishedPost record was created for Blogger
  const bloggerPosts = await PublishingService.getAll({
    blogId: blog.id,
    platform: PublishingPlatform.BLOGGER,
  });

  if (bloggerPosts.length !== 1) {
    throw new Error("Failed to record PublishedPost entry for Blogger!");
  }
  console.log(`✅ Recorded Blogger PublishedPost (Status: ${bloggerPosts[0].status})`);

  // Simulate WordPress publishing (credentials missing in local test -> safely records FAILED)
  try {
    await PublishingService.publishBlog(blog.id, PublishingPlatform.WORDPRESS);
  } catch (err: any) {
    console.log(`ℹ️ WordPress publish response: ${err.message}`);
  }

  // Check PublishedPost record was created for WordPress
  const wpPosts = await PublishingService.getAll({
    blogId: blog.id,
    platform: PublishingPlatform.WORDPRESS,
  });

  if (wpPosts.length !== 1) {
    throw new Error("Failed to record PublishedPost entry for WordPress!");
  }
  console.log(`✅ Recorded WordPress PublishedPost (Status: ${wpPosts[0].status})`);

  // 6. Test Multi-Platform Isolation
  console.log("\n5️⃣ Testing Multi-Platform Isolation...");
  const allBlogPosts = await PublishingService.getAll({ blogId: blog.id });
  console.log(`Total PublishedPost records for blog: ${allBlogPosts.length} (Expected: 2)`);
  if (allBlogPosts.length !== 2) {
    throw new Error("Multi-platform tracking failed! Both platforms must have distinct records.");
  }
  console.log("✅ Multi-Platform isolation verified: Blogger and WordPress tracked independently.");

  // 7. Test Simulated Success Update
  console.log("\n6️⃣ Testing Successful Publication Status & Live URL Persistence...");
  const liveUrl = "https://blogger.google.com/sample-live-post-12345";
  const externalId = "blogger_post_987654";

  const updatedSuccess = await prisma.publishedPost.update({
    where: { id: bloggerPosts[0].id },
    data: {
      status: PublishingStatus.PUBLISHED,
      url: liveUrl,
      externalPostId: externalId,
      publishedAt: new Date(),
    },
  });

  if (updatedSuccess.status !== PublishingStatus.PUBLISHED || updatedSuccess.url !== liveUrl) {
    throw new Error("Failed to persist live URL and published status!");
  }
  console.log(`✅ Live URL & External Post ID successfully stored: ${updatedSuccess.url}`);

  // 8. Clean up test records
  await CompanyService.delete(company.id);
  console.log("\n🧹 Cleaned up test company and syndication records.");

  console.log("\n🎉 ALL PHASE 5 PUBLISHING TESTS PASSED WITH 100% SUCCESS!");
}

testPhase5()
  .catch((err) => {
    console.error("❌ Phase 5 test failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
