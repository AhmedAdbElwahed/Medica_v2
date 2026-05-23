import apiClient from "./client";
import { BillResponse, BillFilters } from "@/types/billing.types";
import { Page } from "@/types/common.types";

export const billingApi = {
  getAllBills: async (filters: BillFilters) => {
    const res = await apiClient.get<Page<BillResponse>>("/payments/bills/admin", { params: filters });
    return res;
  },

  getById: async (id: number) => {
    const res = await apiClient.get<BillResponse>(`/payments/bills/${id}`);
    return res;
  },

  refund: async (id: number) => {
    const res = await apiClient.post<BillResponse>(`/payments/bills/${id}/refund`);
    return res;
  },
};
