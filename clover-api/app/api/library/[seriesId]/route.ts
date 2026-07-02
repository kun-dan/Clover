import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { badRequest, notFound, ok, serverError } from "@/lib/response";

const VALID_STATUSES = ["READING", "COMPLETED", "DROPPED", "PLAN_TO_READ"];

export async function PUT(
  req: NextRequest,
  { params }: { params: { seriesId: string } }
) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) return badRequest("Invalid status");
      updateData.status = body.status;
    }
    if (body.currentChapter !== undefined) {
      updateData.currentChapter = body.currentChapter;
    }

    const entry = await prisma.libraryEntry.update({
      where: {
        userId_seriesId: {
          userId: BigInt(user!.userId),
          seriesId: BigInt(params.seriesId),
        },
      },
      data: updateData,
      include: { series: true },
    }).catch(() => null);

    if (!entry) return notFound("Library entry not found");
    return ok({
      id: entry.id.toString(),
      seriesId: entry.seriesId.toString(),
      status: entry.status,
      currentChapter: entry.currentChapter.toString(),
      updatedAt: entry.updatedAt,
    });
  } catch {
    return serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { seriesId: string } }
) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    await prisma.libraryEntry.delete({
      where: {
        userId_seriesId: {
          userId: BigInt(user!.userId),
          seriesId: BigInt(params.seriesId),
        },
      },
    }).catch(() => null);
    return ok({ deleted: true });
  } catch {
    return serverError();
  }
}
