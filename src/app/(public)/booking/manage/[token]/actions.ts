"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { rescheduleSchema } from "@/lib/validation";
import { isSlotBookable, parseDateOnly } from "@/lib/booking";
import { signActionToken } from "@/lib/token";
import { appUrl } from "@/lib/url";
import { logAudit } from "@/lib/audit";
import {
  sendBookingReceivedToCustomer,
  sendBookingSummaryToOwner,
} from "@/lib/email";

export type ManageState = { error?: string; ok?: string };

export async function cancelBooking(
  token: string,
): Promise<ManageState> {
  const appointment = await prisma.appointment.findUnique({
    where: { manageToken: token },
  });
  if (!appointment) return { error: "Booking not found." };
  if (appointment.status === "CANCELLED") {
    return { ok: "This booking is already cancelled." };
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CANCELLED" },
  });
  await logAudit({
    action: "appointment.cancelled_by_customer",
    target: appointment.id,
  });
  revalidatePath(`/booking/manage/${token}`);
  return { ok: "Your booking has been cancelled." };
}

export async function rescheduleBooking(
  token: string,
  _prev: ManageState,
  formData: FormData,
): Promise<ManageState> {
  const parsed = rescheduleSchema.safeParse({
    date: formData.get("date"),
    time: formData.get("time"),
  });
  if (!parsed.success) {
    return { error: "Please choose a new date and time." };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { manageToken: token },
  });
  if (!appointment) return { error: "Booking not found." };
  if (appointment.status === "CANCELLED") {
    return { error: "Cancelled bookings can't be rescheduled. Please book again." };
  }

  const settings = await getSettings();
  const newDate = parseDateOnly(parsed.data.date);
  if (!newDate) return { error: "Invalid date." };

  const bookable = await isSlotBookable(
    parsed.data.date,
    parsed.data.time,
    settings,
    appointment.id,
  );
  if (!bookable) {
    return { error: "That time slot isn't available. Please pick another." };
  }

  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      date: newDate,
      time: parsed.data.time,
      status: "PENDING", // re-enter the approval queue
    },
  });

  // Re-notify: customer (pending) and owner (with fresh approve/reject links).
  const manageUrl = appUrl(`/booking/manage/${updated.manageToken}`);
  const approveUrl = appUrl(
    `/api/appointments/${updated.id}/approve?token=${signActionToken({
      appointmentId: updated.id,
      action: "approve",
    })}`,
  );
  const rejectUrl = appUrl(
    `/api/appointments/${updated.id}/reject?token=${signActionToken({
      appointmentId: updated.id,
      action: "reject",
    })}`,
  );
  await Promise.allSettled([
    sendBookingReceivedToCustomer(updated, settings, manageUrl),
    sendBookingSummaryToOwner(updated, settings, approveUrl, rejectUrl),
  ]);

  await logAudit({
    action: "appointment.rescheduled_by_customer",
    target: updated.id,
    metadata: { date: parsed.data.date, time: parsed.data.time },
  });

  revalidatePath(`/booking/manage/${token}`);
  return { ok: "Your booking was rescheduled and is pending confirmation." };
}
