import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanup() {
  console.log("Deletando drivers sem CNH...");

  const result = await prisma.drivers.deleteMany({
    where: {
      licenseNumber: null,
    },
  });

  console.log("Deletados:", result.count, "drivers");

  const remaining = await prisma.drivers.count({
    where: {
      licenseNumber: null,
    },
  });

  console.log("Restantes com CNH null:", remaining);

  await prisma.$disconnect();
}

cleanup().catch((error) => {
  console.error("Erro:", error);
  process.exit(1);
});
