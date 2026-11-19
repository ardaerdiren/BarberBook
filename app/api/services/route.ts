import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, name: true, durationMinutes: true, price: true },
      orderBy: { name: "asc" },
    });

    return Response.json(services, { status: 200 });
  } catch (error) {
    console.error("GET /api/services failed:", error);

    return Response.json(
      { error: "Hizmetler alınırken bir sunucu hatası oluştu." },
      { status: 500 },
    );
  }
}
