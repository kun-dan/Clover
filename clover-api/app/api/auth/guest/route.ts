import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { issueTokenPair } from "@/lib/auth";
import { created, serverError } from "@/lib/response";

export async function POST() {
  try {
    const email = `guest-${randomUUID()}@guest.clover.local`;
    const user = await prisma.user.create({
      data: { email, displayName: "Guest", isGuest: true },
    });

    const tokens = await issueTokenPair(user.id, user.email);
    return created({
      ...tokens,
      user: { id: user.id.toString(), email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl, isGuest: true },
    });
  } catch {
    return serverError("Failed to start guest session");
  }
}
