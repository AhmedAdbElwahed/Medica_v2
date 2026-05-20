import apiClient from "./client";
import { WardDto, WardResponse } from "@/types/ward.types";
import { Page } from "@/types/common.types";

export const wardApi = {
  getAll: () => 
    apiClient.get<Page<WardResponse>>("/wards"),
    
  getById: (id: number) => 
    apiClient.get<WardResponse>(`/wards/${id}`),
    
  create: (data: Partial<WardDto>) => 
    apiClient.post<WardResponse>("/wards", data),
    
  update: (id: number, data: Partial<WardDto>) => 
    apiClient.put<WardResponse>(`/wards/${id}`, data),
    
  delete: (id: number) => 
    apiClient.delete<void>(`/wards/${id}`),
};
