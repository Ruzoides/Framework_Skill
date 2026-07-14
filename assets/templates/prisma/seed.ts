import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("No seed data configured yet — edit prisma/seed.ts to add some.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
