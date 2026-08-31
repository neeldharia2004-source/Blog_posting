import fs from "fs";
import path from "path";

// Load .env
try {
  const envFile = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^\s*([A-Za-z_0-9]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  }
} catch {}

import { prisma } from "../lib/prisma";
import { CompanyService } from "../services/company.service";
import { SectionService } from "../services/section.service";
import { ProductService } from "../services/product.service";
import { ProjectService } from "../services/project.service";
import { ContextService } from "../services/context.service";
import { ContextBuilder } from "../lib/context/context-builder";
import { BlogService } from "../services/blog.service";
import { PublishingService } from "../services/publishing.service";
import { PublisherFactory } from "../lib/publishing";
import { BlogStatus, PublishingPlatform, PublishingStatus } from "@prisma/client";

async function runMasterTest() {
  console.log("==================================================");
  console.log("🚀 STARTING COMPLETE END-TO-END MASTER SYSTEM TEST");
  console.log("==================================================\n");

  const startTime = Date.now();

  // 1. Database Connectivity
  console.log("1️⃣ [Database] Checking PostgreSQL connection & tables...");
  await prisma.$connect();
  const initialCompanyCount = await prisma.company.count();
  const initialBlogCount = await prisma.blog.count();
  console.log(`✅ PostgreSQL Connected. Existing companies: ${initialCompanyCount}, blogs: ${initialBlogCount}.\n`);

  // 2. Organization Hierarchy (Phase 2)
  console.log("2️⃣ [Hierarchy] Creating Test Company -> Section -> Product -> Project...");
  const company = await CompanyService.create({
    name: "MasterTest Autonomous Systems",
    description: "Enterprise robotics and edge intelligence co-processors.",
  });

  const section = await SectionService.create(company.id, {
    name: "Industrial Robotics Division",
    description: "Sub-millisecond robotic arm kinematics and vision algorithms.",
  });

  const product = await ProductService.create(section.id, {
    name: "RoboEdge Kinetic Pro",
    description: "6-DOF collaborative robotic controller with integrated ISO 10218 safety loops.",
  });

  const projectA = await ProjectService.create(company.id, {
    name: "Automated Factory Floor Safety Campaign",
    description: "Establishing robotic co-presence safety benchmarks in automotive manufacturing.",
  });

  const projectB = await ProjectService.create(company.id, {
    name: "Isolated Warehouse Fleet Project",
    description: "AGV lidar mapping studies.",
  });
  console.log(`✅ Organization Hierarchy created successfully.\n`);

  // 3. Context Ingestion & Strict Isolation (Phase 3)
  console.log("3️⃣ [Context Ingestion] Testing context ingestion & isolation...");
  const txtFile = await ContextService.createFromFile(
    projectA.id,
    Buffer.from("RoboEdge safety reaction latency benchmark is strictly 4.2 milliseconds across 100,000 cycles.", "utf-8"),
    "roboedge-safety-specs.txt",
    "text/plain"
  );

  const mdFile = await ContextService.createFromFile(
    projectA.id,
    Buffer.from("# Factory Guidelines\n- Tone: Medically and technically precise.\n- Avoid speculative unverified claims.", "utf-8"),
    "factory-guidelines.md",
    "text/markdown"
  );

  const projectAFiles = await ContextService.getByProjectId(projectA.id);
  const projectBFiles = await ContextService.getByProjectId(projectB.id);

  console.log(`Project A context count: ${projectAFiles.length} (Expected: 2)`);
  console.log(`Project B context count: ${projectBFiles.length} (Expected: 0)`);

  if (projectAFiles.length !== 2 || projectBFiles.length !== 0) {
    throw new Error("Context isolation failure!");
  }
  console.log("✅ Context Ingestion & Strict Project Isolation verified.\n");

  // 4. Hierarchical Context Compilation & Live Gemini AI Generation (Phase 4)
  console.log("4️⃣ [AI Generation] Compiling context & calling Google Gemini 2.5 Flash...");
  const compiledContext = await ContextBuilder.buildContext({
    projectId: projectA.id,
    sectionId: section.id,
    productId: product.id,
  });

  if (!compiledContext.includes("MasterTest Autonomous Systems") || !compiledContext.includes("4.2 milliseconds")) {
    throw new Error("Context compilation incomplete!");
  }

  const generatedBlog = await BlogService.generate(projectA.id, {
    title: "How Collaborative Robotics Work Safely Alongside Human Operators on Factory Floors",
    topic: "Robotic Safety Standards & 4.2ms Latency Benchmarks",
    userInstructions: "Focus on ISO 10218 safety loops and 4.2ms reaction latency.",
    sectionId: section.id,
    productId: product.id,
  });

  console.log(`✅ Blog Generated: "${generatedBlog.title}" (ID: ${generatedBlog.id})`);
  console.log(`Status: ${generatedBlog.status} | Content Length: ${generatedBlog.content.length} chars.`);

  if (generatedBlog.status !== BlogStatus.GENERATED) {
    throw new Error("Blog status is not GENERATED!");
  }

  // 5. Editorial Review & Status Approval
  console.log("\n5️⃣ [Editorial Review] Updating content & transitioning to APPROVED...");
  const approvedBlog = await BlogService.update(generatedBlog.id, {
    status: BlogStatus.APPROVED,
  });
  console.log(`✅ Blog Status transitioned to: ${approvedBlog.status}\n`);

  // 6. Multi-Platform Publishing (Phase 5)
  console.log("6️⃣ [Publishing] Testing live syndication to Google Blogger and WordPress...");

  // Publish to Blogger
  console.log("📡 Publishing to Google Blogger...");
  const bloggerPost = await PublishingService.publishBlog(approvedBlog.id, PublishingPlatform.BLOGGER);
  console.log(`✅ Google Blogger Success! Post ID: ${bloggerPost.externalPostId} | URL: ${bloggerPost.url}`);

  // Publish to WordPress
  console.log("📡 Publishing to WordPress...");
  const wpPost = await PublishingService.publishBlog(approvedBlog.id, PublishingPlatform.WORDPRESS);
  console.log(`✅ WordPress Success! Post ID: ${wpPost.externalPostId} | URL: ${wpPost.url}`);

  // Check parent blog status
  const finalBlog = await BlogService.getById(approvedBlog.id);
  console.log(`Parent Blog Final Status: ${finalBlog?.status} (Expected: PUBLISHED)`);
  console.log(`Syndicated PublishedPosts count: ${finalBlog?.publishedPosts.length} (Expected: 2)\n`);

  if (finalBlog?.status !== BlogStatus.PUBLISHED || finalBlog?.publishedPosts.length !== 2) {
    throw new Error("Multi-platform publication records verification failed!");
  }

  // 7. Cascade Deletion Cleanup
  console.log("7️⃣ [Cleanup] Testing cascade delete cleanup...");
  await CompanyService.delete(company.id);
  const checkCompany = await prisma.company.findUnique({ where: { id: company.id } });
  const checkBlog = await prisma.blog.findUnique({ where: { id: approvedBlog.id } });
  if (checkCompany || checkBlog) throw new Error("Cascade delete failed!");
  console.log("✅ All test records cleanly purged.\n");

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log("==================================================");
  console.log(`🎉 MASTER TEST COMPLETED SUCCESSFULLY IN ${totalTime}s`);
  console.log("==================================================");
}

runMasterTest()
  .catch((err) => {
    console.error("❌ Master test failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
