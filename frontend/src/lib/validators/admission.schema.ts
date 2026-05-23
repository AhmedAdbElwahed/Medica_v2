import { z } from "zod";

export const admissionSchema = z.object({
  patientId: z.coerce.number().min(1, "Patient is required"),
  doctorId: z.coerce.number().min(1, "Doctor is required"),
  wardId: z.coerce.number().min(1, "Ward is required"),
  admissionType: z.enum(["GENERAL", "URGENT"]),
  diagnosisOnAdmission: z.string().min(5, "Diagnosis must be at least 5 characters"),
  admissionDate: z.string().min(1, "Admission date is required"),
  expectedDischargeDate: z.string().optional(),
});

export type AdmissionValues = z.infer<typeof admissionSchema>;
