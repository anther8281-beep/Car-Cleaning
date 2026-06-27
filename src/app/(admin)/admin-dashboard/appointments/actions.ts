"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { appUrl } from "@/lib/url";
import { logAudit } from "@/lib/audit";
import {
  sendBookingConfirmedToCustomer,
  sendBookingRejectedToCustomer,
} from "@/lib/email";
import type { AppointmentStatus } from "@/generated/prisma/client";

const VALID_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "RESCHEDULED",
];

export async function approveAppointment(id: string): Promise<void> {
  const session = await requireUser();
  const appt = await prisma.appointment.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });
  const settings = await getSettings();
  await sendBookingConfirmedToCustomer(
    appt,
    settings,
    appUrl(`/booking/manage/${appt.manageToken}`),
  );
  await logAudit({
    userId: session.user.id,
    action: "appointment.approved",
    target: id,
  });
  revalidatePath("/admin-dashboard/appointments");
}

export async function rejectAppointment(id: string): Promise<void> {
  const session = await requireUser();
  const appt = await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  const settings = await getSettings();
  await sendBookingRejectedToCustomer(appt, settings);
  await logAudit({
    userId: session.user.id,
    action: "appointment.rejected",
    target: id,
  });
  revalidatePath("/admin-dashboard/appointments");
}

export async function setAppointmentStatus(
  id: string,
  status: string,
): Promise<void> {
  const session = await requireUser();
  if (!VALID_STATUSES.includes(status as AppointmentStatus)) return;
  await prisma.appointment.update({
    where: { id },
    data: { status: status as AppointmentStatus },
  });
  await logAudit({
    userId: session.user.id,
    action: "appointment.status_changed",
    target: id,
    metadata: { status },
  });
  revalidatePath("/admin-dashboard/appointments");
}

export async function setAdminNotes(id: string, notes: string): Promise<void> {
  const session = await requireUser();
  await prisma.appointment.update({
    where: { id },
    data: { adminNotes: notes.trim() ? notes.trim().slice(0, 2000) : null },
  });
  await logAudit({
    userId: session.user.id,
    action: "appointment.admin_notes_updated",
    target: id,
  });
  revalidatePath("/admin-dashboard/appointments");
}

export async function deleteAppointment(id: string): Promise<void> {
  const session = await requireUser();
  await prisma.appointment.delete({ where: { id } });
  await logAudit({
    userId: session.user.id,
    action: "appointment.deleted",
    target: id,
  });
  revalidatePath("/admin-dashboard/appointments");
}
