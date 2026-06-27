"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  cancelBooking,
  rescheduleBooking,
  type ManageState,
} from "./actions";

const todayStr = () => new Date().toISOString().slice(0, 10);

export function ManagePanel({
  token,
  status,
}: {
  token: string;
  status: string;
  service: string;
}) {
  const isCancelled = status === "CANCELLED";
  const [showReschedule, setShowReschedule] = useState(false);

  if (isCancelled) {
    return (
      <p className="mt-6 text-sm text-[var(--muted)]">
        This booking has been cancelled. To book again, visit the{" "}
        <a href="/booking" className="text-[var(--primary)] underline">
          booking page
        </a>
        .
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {!showReschedule ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowReschedule(true)}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Reschedule
          </button>
          <CancelButton token={token} />
        </div>
      ) : (
        <RescheduleForm
          token={token}
          onCancel={() => setShowReschedule(false)}
        />
      )}
    </div>
  );
}

function CancelButton({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ManageState | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setResult(await cancelBooking(token));
          })
        }
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? "Cancelling…" : "Cancel booking"}
      </button>
      {result?.ok ? (
        <p className="mt-2 text-sm text-green-700">{result.ok}</p>
      ) : null}
      {result?.error ? (
        <p className="mt-2 text-sm text-red-700">{result.error}</p>
      ) : null}
    </div>
  );
}

function RescheduleForm({
  token,
  onCancel,
}: {
  token: string;
  onCancel: () => void;
}) {
  const action = rescheduleBooking.bind(null, token);
  const [state, formAction, pending] = useActionState<ManageState, FormData>(
    action,
    {},
  );

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }
    let active = true;
    setLoading(true);
    setTime("");
    fetch(`/api/appointments/availability?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setClosed(d.closed);
        setSlots(d.slots ?? []);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [date]);

  return (
    <form action={formAction} className="space-y-4">
      {state.ok ? (
        <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.ok}
        </p>
      ) : null}
      {state.error ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <input type="hidden" name="time" value={time} />
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          New date
        </label>
        <input
          type="date"
          name="date"
          required
          min={todayStr()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
        />
      </div>

      {date ? (
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            New time
          </label>
          {loading ? (
            <p className="mt-2 text-sm text-[var(--muted)]">Checking…</p>
          ) : closed ? (
            <p className="mt-2 text-sm text-[var(--muted)]">Closed this day.</p>
          ) : slots.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">No times available.</p>
          ) : (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTime(s)}
                  className={`rounded-md border px-2 py-2 text-sm ${
                    time === s
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] text-[var(--foreground)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending || !time}
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Confirm new time"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)]"
        >
          Back
        </button>
      </div>
    </form>
  );
}
