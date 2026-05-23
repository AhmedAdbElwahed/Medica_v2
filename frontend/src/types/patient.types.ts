export interface PatientDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl?: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  address: string;
  phone: string;
  nationality: string;
  bloodType: string;
  insurancePolicyNumber: string;
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
}

export interface PatientResponse extends PatientDto {
  registrationDate: string;
}
