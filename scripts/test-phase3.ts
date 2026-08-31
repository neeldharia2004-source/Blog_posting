import { prisma } from "../lib/prisma";
import { CompanyService } from "../services/company.service";
import { ProjectService } from "../services/project.service";
import { ContextService } from "../services/context.service";
import { ContextExtractor } from "../lib/context-extractor";

async function testPhase3() {
  console.log("🧪 Starting Phase 3 End-to-End Context Management Tests...\n");

  // 1. Create a Test Company and Two Projects (for context isolation testing)
  const testCompany = await CompanyService.create({
    name: "Phase3 Test BioTech",
    description: "Genetic sequencing and protein folding platform.",
  });
  console.log(`✅ Created test company: ${testCompany.name}`);

  const projectA = await ProjectService.create(testCompany.id, {
    name: "Alpha CRISPR Gene Therapy Project",
    description: "Targeted oncology clinical trials.",
  });

  const projectB = await ProjectService.create(testCompany.id, {
    name: "Beta mRNA Vaccine Delivery Project",
    description: "Lipid nanoparticle encapsulation studies.",
  });
  console.log(`✅ Created Project A (${projectA.name}) and Project B (${projectB.name})`);

  // 2. Test Plain Text File Ingestion
  console.log("\n1️⃣ Testing Plain Text (.txt) Context Ingestion...");
  const txtContent = "CRISPR-Cas9 target accuracy benchmarks: 99.8% on-target binding in phase 1 in-vitro testing.";
  const txtBuffer = Buffer.from(txtContent, "utf-8");
  const txtFile = await ContextService.createFromFile(
    projectA.id,
    txtBuffer,
    "crispr-accuracy-benchmarks.txt",
    "text/plain"
  );
  console.log(`✅ Ingested TXT file: ${txtFile.fileName} (ID: ${txtFile.id})`);
  if (!txtFile.extractedContent.includes("CRISPR-Cas9 target accuracy")) {
    throw new Error("TXT extraction verification failed!");
  }

  // 3. Test Markdown (.md) File Ingestion
  console.log("\n2️⃣ Testing Markdown (.md) Context Ingestion...");
  const mdContent = `
# Oncology Brand Guidelines
- Voice: Compassionate, medically rigorous, and grounded in clinical statistics.
- Prohibited Terms: Avoid 'miracle cure' or non-peer-reviewed extrapolations.
  `.trim();
  const mdBuffer = Buffer.from(mdContent, "utf-8");
  const mdFile = await ContextService.createFromFile(
    projectA.id,
    mdBuffer,
    "oncology-brand-guidelines.md",
    "text/markdown"
  );
  console.log(`✅ Ingested MD file: ${mdFile.fileName} (ID: ${mdFile.id})`);
  if (!mdFile.extractedContent.includes("Oncology Brand Guidelines")) {
    throw new Error("Markdown extraction verification failed!");
  }

  // 4. Test Direct Note Context Creation
  console.log("\n3️⃣ Testing Direct Note Context Creation...");
  const directNote = await ContextService.createFromText(
    projectA.id,
    "Patient Triage Protocol",
    "Tier 1: High genomic risk marker positive with immediate intervention required within 48 hours."
  );
  console.log(`✅ Created Direct Note: ${directNote.fileName} (ID: ${directNote.id})`);
  if (!directNote.extractedContent.includes("Tier 1: High genomic risk")) {
    throw new Error("Direct note extraction verification failed!");
  }

  // 5. Test Strict Context Isolation (Project A vs Project B)
  console.log("\n4️⃣ Testing Strict Context Isolation Guarantees...");
  const projectAFiles = await ContextService.getByProjectId(projectA.id);
  const projectBFiles = await ContextService.getByProjectId(projectB.id);

  console.log(`Project A context files count: ${projectAFiles.length} (Expected: 3)`);
  console.log(`Project B context files count: ${projectBFiles.length} (Expected: 0)`);

  if (projectAFiles.length !== 3 || projectBFiles.length !== 0) {
    throw new Error("Context isolation failure! Project B should have 0 context files.");
  }
  console.log("✅ Context Isolation Verified: Project A context is completely isolated from Project B.");

  // 6. Test Context Deletion
  console.log("\n5️⃣ Testing Context File Deletion...");
  await ContextService.delete(directNote.id);
  const checkDeleted = await prisma.contextFile.findUnique({ where: { id: directNote.id } });
  if (checkDeleted) throw new Error("Context file delete failed!");
  console.log("✅ Context file deletion verified.");

  // 7. Clean up test company (Cascades to Project A, Project B, and all remaining context files)
  await CompanyService.delete(testCompany.id);
  console.log("🧹 Cleaned up test company and project context records.");

  console.log("\n🎉 ALL PHASE 3 CONTEXT TESTS PASSED WITH 100% SUCCESS!");
}

testPhase3()
  .catch((err) => {
    console.error("❌ Phase 3 test failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
