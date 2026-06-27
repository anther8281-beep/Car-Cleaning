/** Absolute base URL of the app, for building links in emails. */
export function appUrl(path = ""): string {
  const base =
    process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}
