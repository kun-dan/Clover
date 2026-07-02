import { NextRequest } from "next/server";
import { consumeState } from "@/lib/stateCache";
import { issueTokenPair } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serverError } from "@/lib/response";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
}

interface GoogleIdTokenPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

function decodeIdToken(idToken: string): GoogleIdTokenPayload {
  const payload = idToken.split(".")[1];
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
}

export async function GET(req: NextRequest) {
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) return Response.redirect(`${frontendUrl}/login?error=oauth_failed`);
    if (!consumeState(state)) return Response.redirect(`${frontendUrl}/login?error=invalid_state`);

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        redirect_uri: `${apiUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) return Response.redirect(`${frontendUrl}/login?error=token_exchange_failed`);

    const tokenData: GoogleTokenResponse = await tokenRes.json();
    const profile = decodeIdToken(tokenData.id_token);

    // Upsert user
    let user = await prisma.user.findUnique({ where: { googleId: profile.sub } });
    if (!user) {
      const byEmail = await prisma.user.findUnique({ where: { email: profile.email } });
      if (byEmail) {
        user = await prisma.user.update({
          where: { id: byEmail.id },
          data: { googleId: profile.sub, avatarUrl: profile.picture ?? byEmail.avatarUrl },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: profile.email,
            googleId: profile.sub,
            displayName: profile.name ?? profile.email.split("@")[0],
            avatarUrl: profile.picture,
          },
        });
      }
    }

    const { accessToken, refreshToken } = await issueTokenPair(user.id, user.email);
    return Response.redirect(
      `${frontendUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}`
    );
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return Response.redirect(`${frontendUrl}/login?error=server_error`);
  }
}
