export type Role = "ROLE_ADMIN" | "ROLE_DOCTOR" | "ROLE_PATIENT";

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  otp: string;
}

export interface AdminResetRequest {
  userId: number;
  oldPassword: string;
  newPassword: string;
}
