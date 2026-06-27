"use client";

import { useActionState } from "react";
import Link from "next/link";
import { enableMfa, type EnableMfaState } from "./actions";

export function EnableMfaForm() {
  const [state, formAction, isPending] = useActionState<EnableMfaState, FormData>(
    enableMfa,
    {},
  );

  // Once enabled, show the recovery codes once and stop the form.
  if (state.recoveryCodes) {
    return (
      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-lg font-semibold text-green-700">
          Two-factor authentication enabled
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Save these recovery codes somewhere safe. Each can be used once to sign
          in if you lose your authenticator. They won&apos;t be shown again.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2 font-mono text-sm text-[var(--foreground)]">
          {state.recoveryCodes.map((c) => (
            <li
              key={c}
              className="rounded bg-[var(--surface-muted)] px-3 py-2 text-center tracking-widest"
            >
              {c}
            </li>
          ))}
        </ul>
        <Link
          href="/admin-dashboard"
          className="mt-6 inline-block rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          I&apos;ve saved them — continue
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {state.error ? (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </div>
      ) : null}
      <div>
        <label
          htmlFor="token"
          className="block text-sm font-medium text-[var(--foreground)]"
        >
          Verification code
        </label>
        <input
          id="token"
          name="token"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 tracking-widest text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-[var(--primary)] px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Verifying…" : "Enable two-factor authentication"}
      </button>
    </form>
  );
}
