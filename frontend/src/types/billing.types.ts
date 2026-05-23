export type BillStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface BillResponse {
  id: number;
  appointmentId: number;
  patientName: string;
  doctorName: string;
  appointmentTime: string; // ISO LocalDateTime string e.g. "2026-05-24T10:30:00"
  amount: number; // in piasters
  status: BillStatus;
  kbInvoiceId: string;
  paidAt: string | null; // ISO Instant string or null
}

export interface BillFilters {
  page?: number;
  size?: number;
}
