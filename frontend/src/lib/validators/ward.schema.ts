import { z } from "zod";

export const wardSchema = z.object({
  name: z.string().min(2, "Ward name must be at least 2 characters"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  email: z.string().email("Invalid email address"),
  numberOfBeds: z.coerce.number().min(1, "Number of beds must be at least 1"),
  numberOfNurses: z.coerce.number().min(0, "Number of nurses cannot be negative"),
  genderDesignation: z.enum(["MALE", "FEMALE", "MIXED"]),
  active: z.boolean().default(true),
  locked: z.boolean().default(false),
});

export type WardValues = z.infer<typeof wardSchema>;
