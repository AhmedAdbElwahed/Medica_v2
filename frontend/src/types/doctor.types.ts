export type Specialty =
  | "GENERAL_PRACTICE" | "PEDIATRICS" | "CARDIOLOGY" | "NEUROLOGY"
  | "ONCOLOGY" | "ORTHOPEDICS" | "DERMATOLOGY" | "PSYCHIATRY" | "OPHTHALMOLOGY"
  | "RADIOLOGY" | "GINECOLOGY" | "UROLOGY" | "GASTROENTEROLOGY" | "PULMONOLOGY";

export interface DoctorDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl?: string;
  specialty: Specialty;
  education: string;
  certifications: string;
  yearsOfExperience: number;
  licenseNumber: string;
  workStartTime: string; // "HH:mm"
  workEndTime: string;
  activeStatus: boolean;
  wardId: number;
}

export interface DoctorResponse extends DoctorDto {
  registrationDate: string;
}
