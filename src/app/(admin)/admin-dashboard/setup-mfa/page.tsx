import QRCode from "qrcode";
import { requireUser } from "@/lib/auth/guard";
import { totpUri } from "@/lib/auth/totp";
import { ensureTotpSecret } from "./actions";
import { EnableMfaForm } from "./enable-mfa-form";

export const dynamic = "force-dynamic";

export default async function SetupMfaPage() {
  const session = await requireUser();
  const secret = await ensureTotpSecret();
  const uri = totpUri(secret, session.user.email ?? "admin");
  const qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 220 });

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Set up two-factor authentication
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Scan this QR code with an authenticator app (Google Authenticator, Authy,
        1Password), then enter the current 6-digit code to finish.
      </p>

      <div className="mt-6 flex flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt="TOTP QR code"
          width={220}
          height={220}
          className="rounded-md"
        />
        <p className="mt-4 text-xs text-[var(--muted)]">
          Can&apos;t scan? Enter this key manually:
        </p>
        <code className="mt-1 break-all rounded bg-[var(--surface-muted)] px-2 py-1 text-xs text-[var(--foreground)]">
          {secret}
        </code>
      </div>

      <EnableMfaForm />
    </main>
  );
}
