import { NextRequest } from "next/server";
import { verifyToken, issueTokenPair } from "@/lib/auth";
import { badRequest, ok, serverError, unauthorized } from "@/lib/response";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();
    if (!refreshToken) return badRequest("Refresh token required");

    const payload = await verifyToken(refreshToken).catch(() => null);
    if (!payload) return unauthorized("Invalid or expired refresh token");

    const user = await prisma.user.findUnique({ where: { id: BigInt(payload.userId) } });
    if (!user) return unauthorized("User not found");

    const tokens = await issueTokenPair(user.id, user.email);
    return ok(tokens);
  } catch {
    return serverError();
  }
}
