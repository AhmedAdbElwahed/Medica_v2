import apiClient from "./client";
import { PatientDto, PatientResponse } from "@/types/patient.types";
import { Page } from "@/types/common.types";

export interface PatientFilters {
  name?: string;
  gender?: string;
  page?: number;
  size?: number;
}

export const patientApi = {
  getAll: (filters: PatientFilters) => 
    apiClient.get<Page<PatientResponse>>("/patients", { params: filters }),
    
  getById: (id: number) => 
    apiClient.get<PatientResponse>(`/patients/${id}`),
    
  create: (data: Partial<PatientDto>) => 
    apiClient.post<PatientResponse>("/patients", data),
    
  update: (id: number, data: Partial<PatientDto>) => 
    apiClient.put<PatientResponse>(`/patients/${id}`, data),
    
  delete: (id: number) => 
    apiClient.delete<void>(`/patients/${id}`),
    
  getNew: () => apiClient.get<PatientResponse[]>("/patients/new"),
  getOld: () => apiClient.get<PatientResponse[]>("/patients/old"),
  getToday: () => apiClient.get<PatientResponse[]>("/patients/today"),
};
