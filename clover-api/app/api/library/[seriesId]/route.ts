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
    if (body.selectedSourceId !== undefined) {
      if (body.selectedSourceId === null) {
        updateData.selectedSourceId = null;
      } else {
        const source = await prisma.readingSource.findFirst({
          where: {
            id: BigInt(body.selectedSourceId),
            seriesId: BigInt(params.seriesId),
            OR: [{ userId: null }, { userId: BigInt(user!.userId) }],
          },
        });
        if (!source) return badRequest("Invalid source");
        updateData.selectedSourceId = source.id;
      }
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

    // Being caught up on a series means there's nothing left to notify about for
    // it — clear any unread updates for chapters at or below where the user now is,
    // so the sidebar/Updates tab don't keep surfacing chapters already read.
    if (body.currentChapter !== undefined) {
      await prisma.$executeRaw`
        UPDATE user_updates uu
        SET is_read = true
        FROM chapter_updates cu
        WHERE uu.chapter_update_id = cu.id
          AND uu.user_id = ${BigInt(user!.userId)}
          AND cu.series_id = ${BigInt(params.seriesId)}
          AND cu.chapter_number <= ${entry.currentChapter.toString()}::numeric
          AND uu.is_read = false
      `;
    }

    return ok({
      id: entry.id.toString(),
      seriesId: entry.seriesId.toString(),
      status: entry.status,
      currentChapter: entry.currentChapter.toString(),
      selectedSourceId: entry.selectedSourceId ? entry.selectedSourceId.toString() : null,
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
