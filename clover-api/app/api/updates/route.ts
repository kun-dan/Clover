import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { ok, serverError } from "@/lib/response";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") !== "false";

  try {
    const updates = await prisma.userUpdate.findMany({
      where: {
        userId: BigInt(user!.userId),
        ...(unreadOnly ? { isRead: false } : {}),
      },
      include: {
        chapterUpdate: {
          include: { series: { select: { id: true, title: true, coverUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return ok(
      updates.map((u) => ({
        id: u.id.toString(),
        isRead: u.isRead,
        createdAt: u.createdAt,
        chapter: {
          id: u.chapterUpdate.id.toString(),
          number: u.chapterUpdate.chapterNumber.toString(),
          provider: u.chapterUpdate.sourceProvider,
          detectedAt: u.chapterUpdate.detectedAt,
        },
        series: {
          id: u.chapterUpdate.series.id.toString(),
          title: u.chapterUpdate.series.title,
          coverUrl: u.chapterUpdate.series.coverUrl,
        },
      }))
    );
  } catch {
    return serverError();
  }
}
