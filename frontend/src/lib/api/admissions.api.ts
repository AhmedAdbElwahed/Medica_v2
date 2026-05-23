import apiClient from "./client";
import { AdmissionDto, CreateAdmissionDto, DischargeAdmissionDto } from "@/types/admission.types";
import { Page } from "@/types/common.types";

export interface AdmissionFilters {
  page?: number;
  size?: number;
}

export const admissionsApi = {
  getAll: async (filters?: AdmissionFilters) => {
    return apiClient.get<Page<AdmissionDto>>("/admissions", { params: filters });
  },

  getById: async (id: number) => {
    return apiClient.get<AdmissionDto>(`/admissions/${id}`);
  },

  create: async (data: CreateAdmissionDto) => {
    return apiClient.post<AdmissionDto>("/admissions", data);
  },

  discharge: async (id: number, data: DischargeAdmissionDto) => {
    return apiClient.put<AdmissionDto>(`/admissions/${id}/discharge`, data);
  },
};
