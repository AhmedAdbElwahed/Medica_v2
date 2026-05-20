export type AppointmentStatus = "PENDING" | "COMPLETED" | "CANCELED";

export interface AppointmentResponseDto {
  id: number;
  patientName: string;
  doctorName: string;
  startTime: string; // ISO string
  reasonForVisit: string;
  isVirtual: boolean;
  status: AppointmentStatus;
  paid: boolean;
}

export interface BookAppointmentRequest {
  doctorId: number;
  startTime: string; // "HH:mm"
  reasonForVisit: string;
  isVirtual: boolean;
}
