import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { notFound, ok, serverError } from "@/lib/response";

function userToDto(u: { id: bigint; email: string; displayName: string | null; avatarUrl: string | null; googleId: string | null; createdAt: Date }) {
  return {
    id: u.id.toString(),
    email: u.email,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    hasGoogleLinked: u.googleId !== null,
    createdAt: u.createdAt,
  };
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: BigInt(user!.userId) } });
    if (!dbUser) return notFound("User not found");
    return ok(userToDto(dbUser));
  } catch {
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    const { displayName, avatarUrl } = await req.json();
    const updated = await prisma.user.update({
      where: { id: BigInt(user!.userId) },
      data: { displayName, avatarUrl },
    });
    return ok(userToDto(updated));
  } catch {
    return serverError();
  }
}
