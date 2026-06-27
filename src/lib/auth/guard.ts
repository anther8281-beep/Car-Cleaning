import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Session } from "next-auth";

/**
 * Require an authenticated admin/owner session in a Server Component or Server
 * Action. Redirects to the login page when there is no valid session. This is
 * the real authorization gate (the proxy only does an optimistic check).
 */
export async function requireUser(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    redirect("/secure-admin-login");
  }
  return session;
}
