export type GenderDesignation = "MALE" | "FEMALE" | "MIXED";

export interface WardDto {
  id: number;
  name: string;
  phone: string;
  email: string;
  numberOfBeds: number;
  numberOfNurses: number;
  genderDesignation: GenderDesignation;
  active: boolean;
  locked: boolean;
}

export interface WardResponse extends WardDto {
  currentOccupancy: number; // custom for frontend logic
}
