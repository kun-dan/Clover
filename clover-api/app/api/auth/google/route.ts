import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { setState } from "@/lib/stateCache";
import { serverError } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return serverError("Google OAuth not configured");

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") ?? "login"; // "login" | "link"

    const state = `${randomUUID()}:${action}`;
    setState(state);

    const redirectUri = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "select_account",
    });

    return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  } catch {
    return serverError();
  }
}
