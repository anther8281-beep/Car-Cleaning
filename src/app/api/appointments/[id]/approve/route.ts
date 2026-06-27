import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { verifyActionToken } from "@/lib/token";
import { appUrl } from "@/lib/url";
import { logAudit } from "@/lib/audit";
import { sendBookingConfirmedToCustomer } from "@/lib/email";
import { resultPage } from "../../action-result";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const payload = verifyActionToken(token);

  if (!payload || payload.appointmentId !== id || payload.action !== "approve") {
    return resultPage("Invalid or expired link", "This link is no longer valid.");
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return resultPage("Not found", "That appointment no longer exists.");
  }
  if (appointment.status === "CONFIRMED") {
    return resultPage("Already confirmed", "This appointment is already confirmed.");
  }
  if (appointment.status === "CANCELLED") {
    return resultPage("Cancelled", "This appointment was cancelled and can't be approved.");
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });

  const settings = await getSettings();
  await sendBookingConfirmedToCustomer(
    updated,
    settings,
    appUrl(`/booking/manage/${updated.manageToken}`),
  );
  await logAudit({ action: "appointment.approved", target: id });

  return resultPage(
    "Appointment confirmed",
    `${updated.customerName}'s ${updated.service} booking has been confirmed and the customer has been notified.`,
  );
}
