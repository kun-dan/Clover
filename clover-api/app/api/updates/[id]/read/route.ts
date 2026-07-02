import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { forbidden, notFound, ok, serverError } from "@/lib/response";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    const update = await prisma.userUpdate.findUnique({ where: { id: BigInt(params.id) } });
    if (!update) return notFound();
    if (update.userId.toString() !== user!.userId) return forbidden();

    await prisma.userUpdate.update({
      where: { id: BigInt(params.id) },
      data: { isRead: true },
    });
    return ok({ id: params.id, isRead: true });
  } catch {
    return serverError();
  }
}
