import { prisma } from "../lib/prisma";

async function inspect() {
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  console.log("=== TABLES IN POSTGRESQL ===");
  for (const t of tables) {
    console.log(`\n📦 TABLE: ${t.table_name}`);
    const columns = await prisma.$queryRaw<Array<{ column_name: string; data_type: string; is_nullable: string; column_default: string | null }>>`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = ${t.table_name}
      ORDER BY ordinal_position;
    `;
    for (const col of columns) {
      console.log(`  - ${col.column_name.padEnd(18)} : ${col.data_type.padEnd(25)} (Nullable: ${col.is_nullable}, Default: ${col.column_default ?? "none"})`);
    }
  }

  const fks = await prisma.$queryRaw<Array<{ table_name: string; column_name: string; foreign_table_name: string; foreign_column_name: string }>>`
    SELECT
      tc.table_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
  `;

  console.log("\n=== FOREIGN KEY CONSTRAINTS ===");
  for (const fk of fks) {
    console.log(`🔗 ${fk.table_name}.${fk.column_name} ➔ ${fk.foreign_table_name}.${fk.foreign_column_name}`);
  }
}

inspect().finally(() => prisma.$disconnect());
