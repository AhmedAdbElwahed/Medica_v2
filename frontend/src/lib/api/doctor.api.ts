import apiClient from "./client";
import { DoctorDto, DoctorResponse, Specialty } from "@/types/doctor.types";
import { Page } from "@/types/common.types";

export interface DoctorFilters {
  name?: string;
  specialty?: Specialty;
  page?: number;
  size?: number;
}

export const doctorApi = {
  getAll: (filters: DoctorFilters) => 
    apiClient.get<Page<DoctorResponse>>("/doctors", { params: filters }),
    
  getById: (id: number) => 
    apiClient.get<DoctorResponse>(`/doctors/${id}`),
    
  create: (data: Partial<DoctorDto>) => 
    apiClient.post<DoctorResponse>("/doctors", data),
    
  update: (id: number, data: Partial<DoctorDto>) => 
    apiClient.put<DoctorResponse>(`/doctors/${id}`, data),
    
  delete: (id: number) => 
    apiClient.delete<void>(`/doctors/${id}`),
    
  getAvailableTime: (doctorId: number) => 
    apiClient.get<string[]>(`/doctor/get-available-time/${doctorId}`),
};
