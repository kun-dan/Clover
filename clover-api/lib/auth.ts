import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { NextRequest } from "next/server";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "insecure-dev-secret-32chars!!!"
);

const ACCESS_EXPIRY = "1h";
const REFRESH_EXPIRY = "30d";

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
}

export async function signAccessToken(userId: bigint, email: string) {
  return new SignJWT({ userId: userId.toString(), email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .sign(secret);
}

export async function signRefreshToken(userId: bigint, email: string) {
  return new SignJWT({ userId: userId.toString(), email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRY)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as TokenPayload;
}

export async function getAuthUser(
  req: NextRequest
): Promise<TokenPayload | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  try {
    return await verifyToken(header.slice(7));
  } catch {
    return null;
  }
}

export function requireAuth(payload: TokenPayload | null) {
  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function issueTokenPair(userId: bigint, email: string) {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(userId, email),
    signRefreshToken(userId, email),
  ]);
  return { accessToken, refreshToken, expiresIn: 3600 };
}
