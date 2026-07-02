import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { badRequest, conflict, created, notFound, ok, serverError } from "@/lib/response";

const VALID_STATUSES = ["READING", "COMPLETED", "DROPPED", "PLAN_TO_READ"];

function entryToDto(e: {
  id: bigint; seriesId: bigint; status: string; currentChapter: { toString(): string };
  createdAt: Date; updatedAt: Date;
  series: { id: bigint; title: string; coverUrl: string | null; latestChapter: { toString(): string } | null; seriesStatus: string | null };
}) {
  return {
    id: e.id.toString(),
    seriesId: e.seriesId.toString(),
    status: e.status,
    currentChapter: e.currentChapter.toString(),
    updatedAt: e.updatedAt,
    series: {
      id: e.series.id.toString(),
      title: e.series.title,
      coverUrl: e.series.coverUrl,
      latestChapter: e.series.latestChapter?.toString() ?? null,
      seriesStatus: e.series.seriesStatus,
    },
  };
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const where: Record<string, unknown> = { userId: BigInt(user!.userId) };
    if (status && VALID_STATUSES.includes(status)) where.status = status;

    const entries = await prisma.libraryEntry.findMany({
      where,
      include: { series: true },
      orderBy: { updatedAt: "desc" },
    });
    return ok(entries.map(entryToDto));
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    const { seriesId, status = "PLAN_TO_READ", currentChapter = 0 } = await req.json();
    if (!seriesId) return badRequest("seriesId is required");
    if (!VALID_STATUSES.includes(status)) return badRequest("Invalid status");

    const series = await prisma.series.findUnique({ where: { id: BigInt(seriesId) } });
    if (!series) return notFound("Series not found");

    const existing = await prisma.libraryEntry.findUnique({
      where: { userId_seriesId: { userId: BigInt(user!.userId), seriesId: BigInt(seriesId) } },
    });
    if (existing) return conflict("Series already in library");

    const entry = await prisma.libraryEntry.create({
      data: {
        userId: BigInt(user!.userId),
        seriesId: BigInt(seriesId),
        status,
        currentChapter,
      },
      include: { series: true },
    });
    return created(entryToDto(entry));
  } catch {
    return serverError();
  }
}
