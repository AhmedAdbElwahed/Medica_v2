import { Page } from "./common.types";

export type AppointmentStatus = "PENDING" | "COMPLETED" | "CANCELED";

export interface AppointmentResponse {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  startTime: string; // ISO string e.g. "2026-05-24T10:30:00"
  reasonForVisit: string;
  virtual: boolean;
  status: AppointmentStatus;
  paid: boolean;
  feeAmount: number; // in piasters (EGP cents)
  createdAt: string; // ISO string
}

export interface AdminBookAppointmentRequest {
  patientId: number;
  doctorId: number;
  startTime: string; // ISO string
  reasonForVisit: string;
  virtual: boolean;
  feeAmount: number; // in piasters
}

export interface AppointmentFilters {
  doctorId?: number;
  patientId?: number;
  date?: string; // YYYY-MM-DD
  status?: AppointmentStatus;
  paid?: boolean;
  virtual?: boolean;
  page?: number;
  size?: number;
}
