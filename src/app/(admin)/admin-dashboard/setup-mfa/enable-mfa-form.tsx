"use client";

import { useActionState } from "react";
import { enableMfa, type EnableMfaState } from "./actions";

export function EnableMfaForm() {
  const [state, formAction, isPending] = useActionState<EnableMfaState, FormData>(
    enableMfa,
    {},
  );

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
