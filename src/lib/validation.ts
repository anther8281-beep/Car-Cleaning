import { z } from "zod";

export const bookingSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().min(7, "A valid phone number is required").max(40),
  email: z.string().trim().email("A valid email is required").max(200),
  service: z.string().trim().min(1, "Please choose a service").max(120),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(4000),
});

export const rescheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

// ---- Admin settings ----

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Use a hex color like #1a2e5a");

const hhmm = z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm");

export const serviceSchema = z.object({
  id: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1, "Service name is required").max(120),
  description: z.string().trim().max(1000),
  durationMinutes: z.coerce.number().int().min(15).max(600),
  price: z.coerce.number().min(0).max(100000),
});

const dayHoursSchema = z
  .object({ open: hhmm, close: hhmm })
  .nullable()
  .refine((v) => !v || v.open < v.close, {
    message: "Closing time must be after opening time",
  });

export const weekHoursSchema = z.object({
  mon: dayHoursSchema,
  tue: dayHoursSchema,
  wed: dayHoursSchema,
  thu: dayHoursSchema,
  fri: dayHoursSchema,
  sat: dayHoursSchema,
  sun: dayHoursSchema,
});

export const settingsSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required").max(200),
  phone: z.string().trim().max(40),
  contactEmail: z.string().trim().email("Invalid email").or(z.literal("")),
  seoTitle: z.string().trim().min(1, "SEO title is required").max(200),
  seoDescription: z.string().trim().max(400),
  logoUrl: z.string().trim().url("Must be a valid URL").or(z.literal("")),
  primaryColor: hexColor,
  secondaryColor: hexColor,
  slotIntervalMin: z.coerce.number().int().min(15).max(240),
  services: z.array(serviceSchema).max(50),
  hours: weekHoursSchema,
});

export type SettingsInput = z.infer<typeof settingsSchema>;
