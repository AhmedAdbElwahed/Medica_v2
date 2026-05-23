import apiClient from "./client";
import { AppointmentResponse, AdminBookAppointmentRequest, AppointmentFilters } from "@/types/appointment.types";
import { Page } from "@/types/common.types";

export const appointmentsApi = {
  getAll: async (filters: AppointmentFilters) => {
    const res = await apiClient.get<Page<AppointmentResponse>>("/appointments", { params: filters });
    return res;
  },

  getById: async (id: number) => {
    const res = await apiClient.get<AppointmentResponse>(`/appointments/${id}`);
    return res;
  },

  bookOnBehalf: async (data: AdminBookAppointmentRequest) => {
    const res = await apiClient.post<AppointmentResponse>("/appointments/admin", data);
    return res;
  },

  changeStatus: async (id: number, status: string) => {
    const res = await apiClient.patch<AppointmentResponse>(`/appointments/${id}/status`, { status });
    return res;
  },

  delete: async (id: number) => {
    const res = await apiClient.delete<void>(`/appointments/${id}`);
    return res;
  },
};
