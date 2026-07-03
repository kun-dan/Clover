import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { issueTokenPair } from "@/lib/auth";
import { badRequest, ok, serverError, unauthorized } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return badRequest("Email and password are required");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return unauthorized("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return unauthorized("Invalid credentials");

    const tokens = await issueTokenPair(user.id, user.email);
    return ok({
      ...tokens,
      user: { id: user.id.toString(), email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl, isGuest: user.isGuest },
    });
  } catch {
    return serverError();
  }
}
