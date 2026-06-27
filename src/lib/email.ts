import nodemailer from "nodemailer";
import type { Appointment } from "@/generated/prisma/client";
import type { SiteSettings } from "@/lib/settings";
import { formatTime } from "@/lib/time";

type MailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

let cachedTransport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter | null {
  if (cachedTransport) return cachedTransport;
  const host = process.env.EMAIL_HOST;
  if (!host) return null; // dev fallback: log instead of send
  cachedTransport = nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: Number(process.env.EMAIL_PORT ?? 587) === 465,
    auth:
      process.env.EMAIL_USER && process.env.EMAIL_PASS
        ? { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        : undefined,
  });
  return cachedTransport;
}

const FROM = () =>
  process.env.EMAIL_FROM ?? "Hernandez Auto Detailing <no-reply@example.com>";

/** Low-level send. Never throws — email failures must not break bookings. */
export async function sendMail(input: MailInput): Promise<boolean> {
  const transport = getTransport();
  if (!transport) {
    console.log(
      JSON.stringify({
        level: "info",
        msg: "email_console_fallback",
        to: input.to,
        subject: input.subject,
      }),
    );
    return true;
  }
  try {
    await transport.sendMail({
      from: FROM(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text ?? stripHtml(input.html),
    });
    return true;
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "email_send_failed",
        to: input.to,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    return false;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function detailsTable(a: Appointment): string {
  const rows: [string, string][] = [
    ["Name", a.customerName],
    ["Service", a.service],
    ["Date", formatDate(a.date)],
    ["Time", formatTime(a.time)],
    ["Phone", a.phone],
    ["Email", a.email],
  ];
  if (a.notes) rows.push(["Notes", a.notes]);
  return `<table style="border-collapse:collapse;font-size:14px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">${esc(
          k,
        )}</td><td style="padding:4px 0;color:#111">${esc(v)}</td></tr>`,
    )
    .join("")}</table>`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function shell(title: string, businessName: string, inner: string): string {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
    <h2 style="color:#1a2e5a">${esc(businessName)}</h2>
    <h3 style="color:#111">${esc(title)}</h3>
    ${inner}
    <p style="margin-top:24px;color:#9ca3af;font-size:12px">${esc(
      businessName,
    )}</p>
  </div>`;
}

// ---- High-level notification emails ----

export async function sendBookingReceivedToCustomer(
  a: Appointment,
  settings: SiteSettings,
  manageUrl: string,
): Promise<void> {
  await sendMail({
    to: a.email,
    subject: `We received your booking request — ${settings.businessName}`,
    html: shell(
      "Booking request received",
      settings.businessName,
      `<p>Hi ${esc(a.customerName)}, thanks for your request. It's pending
       confirmation — we'll email you once it's approved.</p>
       ${detailsTable(a)}
       <p style="margin-top:16px"><a href="${esc(
         manageUrl,
       )}" style="color:#1a2e5a">Reschedule or cancel your request</a></p>`,
    ),
  });
}

export async function sendBookingSummaryToOwner(
  a: Appointment,
  settings: SiteSettings,
  approveUrl: string,
  rejectUrl: string,
): Promise<void> {
  const to = settings.contactEmail || process.env.OWNER_EMAIL;
  if (!to) return;
  await sendMail({
    to,
    subject: `New booking request — ${a.service} on ${formatDate(a.date)}`,
    html: shell(
      "New booking request",
      settings.businessName,
      `${detailsTable(a)}
       <p style="margin-top:16px">
         <a href="${esc(
           approveUrl,
         )}" style="background:#16a34a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;margin-right:8px">Approve</a>
         <a href="${esc(
           rejectUrl,
         )}" style="background:#dc2626;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Reject</a>
       </p>`,
    ),
  });
}

export async function sendBookingConfirmedToCustomer(
  a: Appointment,
  settings: SiteSettings,
  manageUrl: string,
): Promise<void> {
  await sendMail({
    to: a.email,
    subject: `Your appointment is confirmed — ${settings.businessName}`,
    html: shell(
      "Appointment confirmed",
      settings.businessName,
      `<p>Hi ${esc(a.customerName)}, your appointment is confirmed. We look
       forward to seeing you!</p>
       ${detailsTable(a)}
       <p style="margin-top:16px"><a href="${esc(
         manageUrl,
       )}" style="color:#1a2e5a">Need to make a change? Reschedule or cancel</a></p>`,
    ),
  });
}

export async function sendBookingRejectedToCustomer(
  a: Appointment,
  settings: SiteSettings,
): Promise<void> {
  await sendMail({
    to: a.email,
    subject: `Update on your booking request — ${settings.businessName}`,
    html: shell(
      "Booking request not available",
      settings.businessName,
      `<p>Hi ${esc(a.customerName)}, unfortunately we can't accommodate your
       requested time. Please book another slot and we'll be glad to help.</p>
       ${detailsTable(a)}`,
    ),
  });
}

export async function sendContactMessageToOwner(
  settings: SiteSettings,
  msg: { name: string; email: string; phone?: string; message: string },
): Promise<void> {
  const to = settings.contactEmail || process.env.OWNER_EMAIL;
  if (!to) return;
  await sendMail({
    to,
    subject: `New contact message from ${msg.name}`,
    html: shell(
      "New contact message",
      settings.businessName,
      `<table style="font-size:14px">
        <tr><td style="color:#6b7280;padding-right:12px">Name</td><td>${esc(
          msg.name,
        )}</td></tr>
        <tr><td style="color:#6b7280;padding-right:12px">Email</td><td>${esc(
          msg.email,
        )}</td></tr>
        ${
          msg.phone
            ? `<tr><td style="color:#6b7280;padding-right:12px">Phone</td><td>${esc(
                msg.phone,
              )}</td></tr>`
            : ""
        }
       </table>
       <p style="margin-top:12px;white-space:pre-wrap">${esc(msg.message)}</p>`,
    ),
  });
}
