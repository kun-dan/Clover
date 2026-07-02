import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { notFound, ok, serverError } from "@/lib/response";
import { seriesToDto } from "@/lib/seriesService";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    const series = await prisma.series.findUnique({ where: { id: BigInt(params.id) } });
    if (!series) return notFound("Series not found");
    return ok(seriesToDto(series));
  } catch {
    return serverError();
  }
}
