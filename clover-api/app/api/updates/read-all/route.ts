import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { ok, serverError } from "@/lib/response";

export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    const result = await prisma.userUpdate.updateMany({
      where: { userId: BigInt(user!.userId), isRead: false },
      data: { isRead: true },
    });
    return ok({ updated: result.count });
  } catch {
    return serverError();
  }
}
