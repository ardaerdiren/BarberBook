import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL tanımlı değil. Seed için PostgreSQL bağlantısı gerekli.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const barbers = [
  { id: "seed-barber-1", name: "Berber 1" },
  { id: "seed-barber-2", name: "Berber 2" },
  { id: "seed-barber-3", name: "Berber 3" },
];

const services = [
  { id: "seed-service-haircut", name: "Saç Kesimi", durationMinutes: 30, price: 700 },
  { id: "seed-service-beard", name: "Sakal Kesimi", durationMinutes: 20, price: 200 },
  { id: "seed-service-care", name: "Bakım", durationMinutes: 10, price: 300 },
  { id: "seed-service-haircut-beard", name: "Saç + Sakal", durationMinutes: 60, price: 900 },
  { id: "seed-service-complete-care", name: "Saç + Sakal + Bakım", durationMinutes: 80, price: 1000 },
];

async function main() {
  await prisma.$transaction([
    ...barbers.map(({ id, name }) =>
      prisma.barber.upsert({
        where: { id },
        update: { name },
        create: { id, name },
      }),
    ),
    ...services.map(({ id, ...data }) =>
      prisma.service.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      }),
    ),
  ]);

  console.log(`Seed tamamlandı: ${barbers.length} berber ve ${services.length} hizmet hazır.`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed işlemi başarısız oldu:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
