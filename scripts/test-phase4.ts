import { prisma } from "../lib/prisma";
import { CompanyService } from "../services/company.service";
import { SectionService } from "../services/section.service";
import { ProductService } from "../services/product.service";
import { ProjectService } from "../services/project.service";
import { ContextService } from "../services/context.service";
import { ContextBuilder } from "../lib/context/context-builder";
import { BlogService } from "../services/blog.service";
import { BlogStatus } from "@prisma/client";

async function testPhase4() {
  console.log("🧪 Starting Phase 4 End-to-End AI Blog Generation & Editor Tests...\n");

  // 1. Setup Test Hierarchy
  const company = await CompanyService.create({
    name: "Phase4 Quantum AI Labs",
    description: "Building topological quantum computing runtimes and AI co-processors.",
  });

  const section = await SectionService.create(company.id, {
    name: "Quantum Runtimes",
    description: "Cryogenic qubit control and error mitigation algorithms.",
  });

  const product = await ProductService.create(section.id, {
    name: "Q-Core Topological Engine",
    description: "10,000 physical qubit simulator with real-time syndrome decoding.",
  });

  const project = await ProjectService.create(company.id, {
    name: "Fault-Tolerant Quantum Computing Campaign",
    description: "Establishing practical timelines for logical qubit fault tolerance in financial modeling.",
  });

  const contextDoc = await ContextService.createFromText(
    project.id,
    "q-core-benchmarks.txt",
    "Q-Core demonstrates a 14x reduction in error syndrome latency compared to surface codes, operating at 15mK temperatures."
  );

  console.log(`✅ Setup Test Hierarchy: Company -> Section -> Product -> Project -> ContextFile.`);

  // 2. Test ContextBuilder
  console.log("\n1️⃣ Testing ContextBuilder compilation...");
  const compiledContext = await ContextBuilder.buildContext({
    projectId: project.id,
    sectionId: section.id,
    productId: product.id,
  });

  console.log("--- Compiled Context Snippet ---");
  console.log(compiledContext.slice(0, 300) + "...\n");

  if (
    !compiledContext.includes("Phase4 Quantum AI Labs") ||
    !compiledContext.includes("Q-Core Topological Engine") ||
    !compiledContext.includes("14x reduction in error syndrome latency")
  ) {
    throw new Error("ContextBuilder failed to ground all hierarchical levels!");
  }
  console.log("✅ ContextBuilder successfully compiled all hierarchical context levels.");

  // 3. Test AI Blog Generation Flow
  console.log("\n2️⃣ Testing AI Blog Generation Pipeline...");
  const generatedBlog = await BlogService.generate(project.id, {
    title: "Why Topological Qubits Will Win the Race to Commercial Fault Tolerance",
    topic: "Quantum Error Mitigation & Q-Core Architecture",
    userInstructions: "Focus on latency numbers and syndrome decoding. Avoid non-technical marketing fluff.",
    sectionId: section.id,
    productId: product.id,
  });

  console.log(`✅ Generated Blog: "${generatedBlog.title}" (ID: ${generatedBlog.id})`);
  console.log(`Status: ${generatedBlog.status}`);

  if (generatedBlog.status !== BlogStatus.GENERATED) {
    throw new Error(`Expected status GENERATED but got ${generatedBlog.status}`);
  }
  if (!generatedBlog.content || generatedBlog.content.length < 100) {
    throw new Error("Generated content is too short or empty!");
  }
  console.log(`Content length: ${generatedBlog.content.length} chars.`);

  // 4. Test Blog Editing & Approval
  console.log("\n3️⃣ Testing Blog Editing & Approval Lifecycle...");
  const updatedBlog = await BlogService.update(generatedBlog.id, {
    title: "Why Topological Qubits Will Win Commercial Fault Tolerance (Reviewed Edition)",
    topic: "Enterprise Quantum Computing",
    content: generatedBlog.content + "\n\n## Final Editorial Addendum\nReviewed and approved by the Chief Quantum Architect.",
    status: BlogStatus.APPROVED,
  });

  console.log(`✅ Updated Blog Status: ${updatedBlog.status}`);
  if (updatedBlog.status !== BlogStatus.APPROVED) {
    throw new Error("Failed to transition blog status to APPROVED!");
  }

  // 5. Test Blog Retrieval by Status
  console.log("\n4️⃣ Testing Blog Filtering by Project and Status...");
  const approvedBlogs = await BlogService.getAll(project.id, BlogStatus.APPROVED);
  if (approvedBlogs.length !== 1) {
    throw new Error(`Expected 1 approved blog, found ${approvedBlogs.length}`);
  }
  console.log(`✅ Found ${approvedBlogs.length} approved blog for this project.`);

  // 6. Test Blog Deletion
  console.log("\n5️⃣ Testing Blog Deletion...");
  await BlogService.delete(generatedBlog.id);
  const checkDeleted = await prisma.blog.findUnique({ where: { id: generatedBlog.id } });
  if (checkDeleted) throw new Error("Blog deletion failed!");
  console.log("✅ Blog deletion verified.");

  // Clean up test company
  await CompanyService.delete(company.id);
  console.log("🧹 Cleaned up test data hierarchy.");

  console.log("\n🎉 ALL PHASE 4 TESTS PASSED WITH 100% SUCCESS!");
}

testPhase4()
  .catch((err) => {
    console.error("❌ Phase 4 test failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
