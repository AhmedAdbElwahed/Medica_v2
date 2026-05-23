import apiClient from "./client";
import { AxiosResponse } from "axios";
import { WardDto, WardResponse } from "@/types/ward.types";
import { Page } from "@/types/common.types";

const mapResponse = (ward: any): WardResponse => {
  if (!ward) return ward;
  return {
    ...ward,
    phone: ward.phoneNumber || ward.phone || "",
    currentOccupancy: ward.currentPatientCount ?? ward.currentOccupancy ?? 0,
  };
};

const mapPageResponse = (response: any): AxiosResponse<Page<WardResponse>> => {
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

export const wardApi = {
  getAll: async () => {
    const res = await apiClient.get<Page<WardResponse>>("/wards");
    return mapPageResponse(res);
  },
    
  getById: async (id: number) => {
    const res = await apiClient.get<WardResponse>(`/wards/${id}`);
    res.data = mapResponse(res.data);
    return res;
  },
    
  create: async (data: Partial<WardDto>) => {
    const { phone, ...rest } = data;
    const requestData = {
      ...rest,
      phoneNumber: phone,
    };
    const res = await apiClient.post<WardResponse>("/wards", requestData);
    res.data = mapResponse(res.data);
    return res;
  },
    
  update: async (id: number, data: Partial<WardDto>) => {
    const { phone, ...rest } = data;
    const requestData = {
      ...rest,
      ...(phone !== undefined ? { phoneNumber: phone } : {}),
    };
    const res = await apiClient.put<WardResponse>(`/wards/${id}`, requestData);
    res.data = mapResponse(res.data);
    return res;
  },
    
  delete: (id: number) => 
    apiClient.delete<void>(`/wards/${id}`),
    
  toggleLock: async (id: number) => {
    const res = await apiClient.patch<WardResponse>(`/wards/${id}/toggle-lock`);
    res.data = mapResponse(res.data);
    return res;
  },
    
  toggleActive: async (id: number) => {
    const res = await apiClient.patch<WardResponse>(`/wards/${id}/toggle-active`);
    res.data = mapResponse(res.data);
    return res;
  },
};
