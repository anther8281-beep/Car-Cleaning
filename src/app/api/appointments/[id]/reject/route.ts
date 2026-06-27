import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { verifyActionToken } from "@/lib/token";
import { logAudit } from "@/lib/audit";
import { sendBookingRejectedToCustomer } from "@/lib/email";
import { resultPage } from "../../action-result";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const payload = verifyActionToken(token);

  if (!payload || payload.appointmentId !== id || payload.action !== "reject") {
    return resultPage("Invalid or expired link", "This link is no longer valid.");
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return resultPage("Not found", "That appointment no longer exists.");
  }
  if (appointment.status === "CANCELLED") {
    return resultPage("Already cancelled", "This appointment is already cancelled.");
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  const settings = await getSettings();
  await sendBookingRejectedToCustomer(updated, settings);
  await logAudit({ action: "appointment.rejected", target: id });

  return resultPage(
    "Booking declined",
    `${updated.customerName}'s request has been declined and the customer has been notified.`,
  );
}
