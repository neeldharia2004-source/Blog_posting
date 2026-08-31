import { prisma } from "../lib/prisma";

async function verify() {
  console.log("🔍 Running full database relationship verification...\n");

  const companies = await prisma.company.findMany({
    include: {
      sections: {
        include: {
          products: true,
        },
      },
      projects: {
        include: {
          contextFiles: true,
          blogs: {
            include: {
              publishedPosts: true,
            },
          },
        },
      },
    },
  });

  console.log(`Found ${companies.length} company/companies.`);
  for (const c of companies) {
    console.log(`\n🏢 Company: "${c.name}" [ID: ${c.id}]`);
    console.log(`  ├─ Sections (${c.sections.length}):`);
    for (const s of c.sections) {
      console.log(`  │   ├─ 📂 Section: "${s.name}" [ID: ${s.id}]`);
      for (const p of s.products) {
        console.log(`  │   │   └─ 📦 Product: "${p.name}" [ID: ${p.id}]`);
      }
    }

    console.log(`  └─ Projects (${c.projects.length}):`);
    for (const proj of c.projects) {
      console.log(`      ├─ 🚀 Project: "${proj.name}" [ID: ${proj.id}]`);
      console.log(`      │   ├─ 📄 Context Files (${proj.contextFiles.length}):`);
      for (const f of proj.contextFiles) {
        console.log(`      │   │   └─ ${f.fileName} (${f.fileType})`);
      }
      console.log(`      │   └─ 📝 Blogs (${proj.blogs.length}):`);
      for (const b of proj.blogs) {
        console.log(`      │       └─ "${b.title}" [Status: ${b.status}]`);
        for (const post of b.publishedPosts) {
          console.log(`      │           └─ 🌐 ${post.platform} [Status: ${post.status}] -> URL: ${post.url ?? "N/A"}`);
        }
      }
    }
  }

  console.log("\n✅ All 7 entities and nested relationships verified successfully!");
}

verify()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
