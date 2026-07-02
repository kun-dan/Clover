import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { badRequest, created, notFound, ok, serverError } from "@/lib/response";

function sourceToDto(s: { id: bigint; provider: string | null; url: string; label: string; userId: bigint | null }) {
  return {
    id: s.id.toString(),
    provider: s.provider,
    url: s.url,
    label: s.label,
    isUserDefined: s.userId !== null,
  };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    const sources = await prisma.readingSource.findMany({
      where: {
        seriesId: BigInt(params.id),
        OR: [{ userId: null }, { userId: BigInt(user!.userId) }],
      },
      orderBy: [{ userId: "asc" }, { createdAt: "asc" }],
    });
    return ok(sources.map(sourceToDto));
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    const { url, label, provider } = await req.json();
    if (!url || !label) return badRequest("url and label are required");

    const series = await prisma.series.findUnique({ where: { id: BigInt(params.id) } });
    if (!series) return notFound("Series not found");

    const source = await prisma.readingSource.create({
      data: {
        seriesId: BigInt(params.id),
        userId: BigInt(user!.userId),
        url,
        label,
        provider: provider ?? "custom",
      },
    });
    return created(sourceToDto(source));
  } catch {
    return serverError();
  }
}
