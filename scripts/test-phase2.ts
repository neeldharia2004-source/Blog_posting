import { prisma } from "../lib/prisma";
import { CompanyService } from "../services/company.service";
import { SectionService } from "../services/section.service";
import { ProductService } from "../services/product.service";
import { ProjectService } from "../services/project.service";
import { StatsService } from "../services/stats.service";

async function testPhase2() {
  console.log("🧪 Starting Phase 2 End-to-End Functional & CRUD Tests...\n");

  // 1. Test Stats Service
  const initialStats = await StatsService.getOverviewStats();
  console.log(`📊 Initial stats: ${initialStats.counts.companies} companies, ${initialStats.counts.projects} projects.`);

  // 2. Test Company Creation
  console.log("\n1️⃣ Testing Company Creation...");
  const newCompany = await CompanyService.create({
    name: "Test Aerospace Corp",
    description: "Suborbital launch and autonomous satellite manufacturing.",
  });
  console.log(`✅ Created company: ${newCompany.name} (ID: ${newCompany.id})`);

  // 3. Test Section Creation under Company
  console.log("\n2️⃣ Testing Section Creation...");
  const newSection = await SectionService.create(newCompany.id, {
    name: "Orbital Launch Systems",
    description: "Reusable rocket stages and avionics.",
  });
  console.log(`✅ Created section: ${newSection.name} (ID: ${newSection.id})`);

  // 4. Test Product Creation under Section
  console.log("\n3️⃣ Testing Product Creation...");
  const newProduct = await ProductService.create(newSection.id, {
    name: "AeroStage Heavy",
    description: "10-ton payload to Low Earth Orbit rocket engine with autonomous landing guidance.",
  });
  console.log(`✅ Created product: ${newProduct.name} (ID: ${newProduct.id})`);

  // 5. Test Project Creation under Company
  console.log("\n4️⃣ Testing Project Creation...");
  const newProject = await ProjectService.create(newCompany.id, {
    name: "Mars Cargo Pathfinder Campaign",
    description: "Thought leadership series covering orbital logistics and methane engine reusability.",
  });
  console.log(`✅ Created project: ${newProject.name} (ID: ${newProject.id})`);

  // 6. Test Company Nested Retrieval (Company -> Section -> Product & Company -> Project)
  console.log("\n5️⃣ Testing Company Nested Hierarchy Retrieval...");
  const companyHierarchy = await CompanyService.getById(newCompany.id);
  if (!companyHierarchy) throw new Error("Company not found");

  if (companyHierarchy.sections.length !== 1 || companyHierarchy.sections[0].products.length !== 1) {
    throw new Error("Hierarchy verification failed for Sections/Products!");
  }
  if (companyHierarchy.projects.length !== 1) {
    throw new Error("Hierarchy verification failed for Projects!");
  }
  console.log(`✅ Verified hierarchy: Company has ${companyHierarchy.sections.length} Section with ${companyHierarchy.sections[0].products.length} Product, and ${companyHierarchy.projects.length} Project.`);

  // 7. Test Updates
  console.log("\n6️⃣ Testing Updates...");
  const updatedCompany = await CompanyService.update(newCompany.id, { name: "AeroSpace Dynamics Global" });
  const updatedSection = await SectionService.update(newSection.id, { name: "Heavy Propulsion Division" });
  const updatedProduct = await ProductService.update(newProduct.id, { name: "AeroStage Heavy Block 2" });
  const updatedProject = await ProjectService.update(newProject.id, { name: "Deep Space Transport Campaign" });
  console.log(`✅ Updated: Company("${updatedCompany.name}"), Section("${updatedSection.name}"), Product("${updatedProduct.name}"), Project("${updatedProject.name}")`);

  // 8. Test Cascading Deletion
  console.log("\n7️⃣ Testing Cascading Deletion...");
  await CompanyService.delete(newCompany.id);
  const checkCompany = await prisma.company.findUnique({ where: { id: newCompany.id } });
  const checkSection = await prisma.section.findUnique({ where: { id: newSection.id } });
  const checkProduct = await prisma.product.findUnique({ where: { id: newProduct.id } });
  const checkProject = await prisma.project.findUnique({ where: { id: newProject.id } });

  if (checkCompany || checkSection || checkProduct || checkProject) {
    throw new Error("Cascade delete failed: orphan records detected!");
  }
  console.log("✅ Cascade delete verified: deleting company cleanly removed all its sections, products, and projects.");

  console.log("\n🎉 ALL PHASE 2 TESTS PASSED WITH 100% SUCCESS!");
}

testPhase2()
  .catch((err) => {
    console.error("❌ Phase 2 test failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
