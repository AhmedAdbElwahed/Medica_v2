import { z } from "zod";

export const appointmentSchema = z.object({
  patientId: z.coerce.number().min(1, "Patient is required"),
  doctorId: z.coerce.number().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time slot is required"),
  reasonForVisit: z.string().min(5, "Reason must be at least 5 characters"),
  virtual: z.boolean().default(false),
  feeAmount: z.coerce.number().min(0, "Fee amount must be a positive number"),
});

export type AppointmentValues = z.infer<typeof appointmentSchema>;
