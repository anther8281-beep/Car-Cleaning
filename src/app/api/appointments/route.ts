import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { bookingSchema } from "@/lib/validation";
import { isSlotBookable, parseDateOnly } from "@/lib/booking";
import { signActionToken } from "@/lib/token";
import { appUrl } from "@/lib/url";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import {
  sendBookingReceivedToCustomer,
  sendBookingSummaryToOwner,
} from "@/lib/email";

export async function POST(request: Request) {
  // Rate limit by client IP to deter spam bookings.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (!rateLimit(`booking:${ip}`, 10, 60 * 60 * 1000).success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const settings = await getSettings();

  // Service must exist in current settings.
  const service = settings.services.find((s) => s.name === input.service);
  if (!service) {
    return NextResponse.json(
      { error: "Selected service is not available." },
      { status: 400 },
    );
  }

  const date = parseDateOnly(input.date);
  if (!date) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  // Prevent booking in the past.
  if (date.getTime() < new Date(new Date().toISOString().slice(0, 10)).getTime()) {
    return NextResponse.json(
      { error: "That date has already passed." },
      { status: 400 },
    );
  }

  if (!(await isSlotBookable(input.date, input.time, settings))) {
    return NextResponse.json(
      { error: "That time slot is no longer available." },
      { status: 409 },
    );
  }

  // Create inside a transaction with a final double-booking guard to close the
  // race between the availability check and the insert.
  let appointment;
  try {
    appointment = await prisma.$transaction(async (tx) => {
      const clash = await tx.appointment.findFirst({
        where: {
          date,
          time: input.time,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: { id: true },
      });
      if (clash) throw new DoubleBookingError();

      return tx.appointment.create({
        data: {
          customerName: input.customerName,
          phone: input.phone,
          email: input.email,
          service: input.service,
          date,
          time: input.time,
          notes: input.notes ? input.notes : null,
        },
      });
    });
  } catch (err) {
    if (err instanceof DoubleBookingError) {
      return NextResponse.json(
        { error: "That time slot was just taken. Please pick another." },
        { status: 409 },
      );
    }
    console.error(
      JSON.stringify({ level: "error", msg: "booking_create_failed" }),
    );
    return NextResponse.json(
      { error: "Could not create booking. Please try again." },
      { status: 500 },
    );
  }

  // Fire notifications (best-effort; failures are logged, not surfaced).
  const manageUrl = appUrl(`/booking/manage/${appointment.manageToken}`);
  const approveUrl = appUrl(
    `/api/appointments/${appointment.id}/approve?token=${signActionToken({
      appointmentId: appointment.id,
      action: "approve",
    })}`,
  );
  const rejectUrl = appUrl(
    `/api/appointments/${appointment.id}/reject?token=${signActionToken({
      appointmentId: appointment.id,
      action: "reject",
    })}`,
  );

  await Promise.allSettled([
    sendBookingReceivedToCustomer(appointment, settings, manageUrl),
    sendBookingSummaryToOwner(appointment, settings, approveUrl, rejectUrl),
  ]);

  await logAudit({
    action: "appointment.created",
    target: appointment.id,
    metadata: { service: input.service, date: input.date, time: input.time },
    ipAddress: ip,
  });

  return NextResponse.json(
    { ok: true, id: appointment.id, manageToken: appointment.manageToken },
    { status: 201 },
  );
}

class DoubleBookingError extends Error {}
