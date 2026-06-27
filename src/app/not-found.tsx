import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-bold text-[var(--primary)]">404</p>
      <h1 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
