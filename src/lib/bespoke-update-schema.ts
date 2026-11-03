import { z } from "zod";

export const bespokeStages = [
  "Enquiry",
  "Research",
  "Design",
  "Approval",
  "Workshop",
  "Completed",
] as const;

const bespokeDate = z
  .string()
  .refine(
    (value) =>
      !value ||
      (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) === value),
    "Enter a valid due date",
  );

export const updateBespokeSchema = z.object({
  reference: z.string().trim().min(1).max(80),
  expectedUpdatedAt: z.string().datetime({ offset: true }),
  clientId: z.string().uuid().nullable(),
  fullName: z.string().trim().min(2, "Customer name is required").max(200),
  phone: z.string().trim().max(80),
  email: z.string().trim().email("Enter a valid email address").or(z.literal("")),
  projectName: z.string().trim().max(200),
  pieceType: z.string().trim().max(100),
  brief: z.string().trim().max(2000),
  research: z.string().trim().max(3000),
  notes: z.string().trim().max(3000),
  nextAction: z.string().trim().max(500),
  nextActionDate: bespokeDate,
  status: z.enum(bespokeStages),
});
