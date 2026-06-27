"use client";

import { useState } from "react";

type Status = { type: "idle" | "ok" | "error"; message?: string };

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: "idle" });

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong.");
      }
      setStatus({
        type: "ok",
        message: "Thanks! Your message has been sent.",
      });
      form.reset();
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {status.type !== "idle" ? (
        <div
          role="status"
          className={
            status.type === "ok"
              ? "rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700"
              : "rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {status.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Name" required />
        <Field name="email" label="Email" type="email" required />
      </div>
      <Field name="phone" label="Phone (optional)" />
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-[var(--foreground)]"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[var(--primary)] px-6 py-2 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-[var(--foreground)]"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
      />
    </div>
  );
}
