/**
 * Disclaimer shown wherever prices appear: listed prices are estimates and the
 * final quote is given in person, since it depends on the vehicle's size and
 * condition.
 */
export function QuoteNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--muted)] ${className}`}
    >
      <span className="font-medium text-[var(--foreground)]">Please note:</span>{" "}
      Listed prices are estimates. Your{" "}
      <strong>final quote is provided in person</strong>{" "}
      and depends on your vehicle&apos;s size and condition.
    </p>
  );
}
