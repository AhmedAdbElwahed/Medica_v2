import apiClient from "./client";
import { 
  RegisterRequest, 
  ResetPasswordRequest, 
  AdminResetRequest 
} from "@/types/auth.types";

export const authApi = {
  registerPatient: (data: RegisterRequest) => 
    apiClient.post<void>("/auth/register", data),

  activate: (otp: string) => 
    apiClient.get<void>(`/auth/activate/${otp}`),

  logout: () => 
    apiClient.post<void>("/auth/logout"),

  requestPasswordReset: (email: string) => 
    apiClient.post<void>(`/auth/password/reset/request?email=${email}`),

  verifyPasswordReset: (data: ResetPasswordRequest) => 
    apiClient.post<void>("/auth/password/reset/confirm", data),

  adminResetPassword: (data: AdminResetRequest) => 
    apiClient.post<void>("/auth/admin/password/reset", data),
};
