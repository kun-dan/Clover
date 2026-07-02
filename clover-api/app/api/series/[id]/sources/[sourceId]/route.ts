import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { forbidden, notFound, ok, serverError } from "@/lib/response";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; sourceId: string } }
) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    const source = await prisma.readingSource.findUnique({
      where: { id: BigInt(params.sourceId) },
    });
    if (!source) return notFound("Source not found");
    if (source.userId === null || source.userId.toString() !== user!.userId)
      return forbidden("Cannot delete system-generated sources");

    await prisma.readingSource.delete({ where: { id: BigInt(params.sourceId) } });
    return ok({ deleted: true });
  } catch {
    return serverError();
  }
}
