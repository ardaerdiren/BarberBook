import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const barbers = await prisma.barber.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return Response.json(barbers, { status: 200 });
  } catch (error) {
    console.error("GET /api/barbers failed:", error);

    return Response.json(
      { error: "Berberler alınırken bir sunucu hatası oluştu." },
      { status: 500 },
    );
  }
}
