import { z } from "zod";

export const patientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  nationality: z.string().min(2, "Nationality is required"),
  bloodType: z.enum([
    "A_POS", "A_NEG", 
    "B_POS", "B_NEG", 
    "AB_POS", "AB_NEG", 
    "O_POS", "O_NEG"
  ]),
  insurancePolicyNumber: z.string().optional().or(z.literal("")),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
});

export type PatientValues = z.infer<typeof patientSchema>;
