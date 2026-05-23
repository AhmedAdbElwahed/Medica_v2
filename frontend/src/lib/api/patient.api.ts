import apiClient from "./client";
import { AxiosResponse } from "axios";
import { PatientDto, PatientResponse } from "@/types/patient.types";
import { Page } from "@/types/common.types";

export interface PatientFilters {
  name?: string;
  gender?: string;
  page?: number;
  size?: number;
}

const mapResponse = (patient: any): PatientResponse => {
  if (!patient) return patient;
  return {
    ...patient,
    phone: patient.phoneNumber || patient.phone || "",
  };
};

const mapPageResponse = (response: any): AxiosResponse<Page<PatientResponse>> => {
  const data = response?.data;
  if (!data) return response;
  return {
    ...response,
    data: {
      ...data,
      content: data.content?.map(mapResponse) || [],
    },
  };
};

export const patientApi = {
  getAll: async (filters: PatientFilters) => {
    const res = await apiClient.get<Page<PatientResponse>>("/patients", { params: filters });
    return mapPageResponse(res);
  },
    
  getById: async (id: number) => {
    const res = await apiClient.get<PatientResponse>(`/patients/${id}`);
    res.data = mapResponse(res.data);
    return res;
  },
    
  create: async (data: Partial<PatientDto>) => {
    const { phone, ...rest } = data;
    const requestData = {
      ...rest,
      phoneNumber: phone,
      // Provide a default secure password for the generated Spring Security user account
      password: "Patient@Medica2026",
    };
    const res = await apiClient.post<PatientResponse>("/patients", requestData);
    res.data = mapResponse(res.data);
    return res;
  },
    
  update: async (id: number, data: Partial<PatientDto>) => {
    const { phone, ...rest } = data;
    const requestData = {
      ...rest,
      ...(phone !== undefined ? { phoneNumber: phone } : {}),
    };
    const res = await apiClient.put<PatientResponse>(`/patients/${id}`, requestData);
    res.data = mapResponse(res.data);
    return res;
  },
    
  delete: (id: number) => 
    apiClient.delete<void>(`/patients/${id}`),
    
  getNew: async () => {
    const res = await apiClient.get<PatientResponse[]>("/patients/new");
    res.data = res.data?.map(mapResponse);
    return res;
  },
  getOld: async () => {
    const res = await apiClient.get<PatientResponse[]>("/patients/old");
    res.data = res.data?.map(mapResponse);
    return res;
  },
  getToday: async () => {
    const res = await apiClient.get<PatientResponse[]>("/patients/today");
    res.data = res.data?.map(mapResponse);
    return res;
  },
};
