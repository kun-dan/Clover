import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { issueTokenPair } from "@/lib/auth";
import { badRequest, conflict, created, serverError } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password) return badRequest("Email and password are required");
    if (password.length < 8) return badRequest("Password must be at least 8 characters");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return conflict("Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName: displayName ?? email.split("@")[0] },
    });

    const tokens = await issueTokenPair(user.id, user.email);
    return created({ ...tokens, user: { id: user.id.toString(), email: user.email, displayName: user.displayName } });
  } catch {
    return serverError();
  }
}
