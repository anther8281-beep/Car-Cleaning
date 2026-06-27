"use client";

import { useActionState, useState } from "react";
import { authenticate, type LoginState } from "./actions";

const initialState: LoginState = { stage: "credentials" };

export default function SecureAdminLoginPage() {
  const [state, formAction, isPending] = useActionState(
    authenticate,
    initialState,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onMfaStage = state.stage === "mfa";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface-muted)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-lg">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">
          Admin sign in
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {onMfaStage
            ? "Enter the 6-digit code from your authenticator app."
            : "Restricted area. Authorized staff only."}
        </p>

        {state.error ? (
          <div
            role="alert"
            className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {state.error}
          </div>
        ) : null}

        <form action={formAction} className="mt-6 space-y-4">
          {/* Always submit email + password so the MFA stage re-validates. */}
          {onMfaStage ? (
            <>
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="password" value={password} />
              <div>
                <label
                  htmlFor="token"
                  className="block text-sm font-medium text-[var(--foreground)]"
                >
                  Authenticator code
                </label>
                <input
                  id="token"
                  name="token"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  placeholder="123456"
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 tracking-widest text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--foreground)]"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[var(--foreground)]"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-[var(--primary)] px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending
              ? "Please wait…"
              : onMfaStage
                ? "Verify & sign in"
                : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
