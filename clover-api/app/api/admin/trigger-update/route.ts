import { NextRequest } from "next/server";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { ok, serverError } from "@/lib/response";
import { runChapterUpdateJob } from "@/jobs/chapterUpdateJob";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    // Run in background, respond immediately
    runChapterUpdateJob().catch(console.error);
    return ok({ message: "Chapter update job triggered" });
  } catch {
    return serverError();
  }
}
