export type AdmissionType = "GENERAL" | "URGENT";

export interface AdmissionDto {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  wardId: number;
  wardName: string;
  admissionType: AdmissionType;
  diagnosisOnAdmission: string;
  diagnosisOnDischarge: string | null;
  admissionDate: string;
  expectedDischargeDate: string | null;
  actualDischargeDate: string | null;
  status: "ACTIVE" | "DISCHARGED";
}

export interface CreateAdmissionDto {
  patientId: number;
  doctorId: number;
  wardId: number;
  admissionType: AdmissionType;
  diagnosisOnAdmission: string;
  admissionDate: string;
  expectedDischargeDate?: string;
}

export interface DischargeAdmissionDto {
  diagnosisOnDischarge: string;
  actualDischargeDate: string;
}
