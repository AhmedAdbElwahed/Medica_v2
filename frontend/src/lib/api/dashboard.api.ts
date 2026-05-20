import apiClient from "./client";
import { 
  SummaryResponse, 
  AdmissionTrend, 
  DepartmentDistribution, 
  RecentActivity 
} from "@/types/dashboard.types";
import { PatientDto } from "@/types/patient.types";
import { AppointmentResponseDto } from "@/types/appointment.types";

export const dashboardApi = {
  getSummary: () => 
    apiClient.get<SummaryResponse>("/dashboard/summary"),
    
  getStatistics: () => 
    apiClient.get<any>("/dashboard/statistics"), // generic for now
    
  getAdmissionTrends: () => 
    apiClient.get<AdmissionTrend[]>("/dashboard/trends/admissions"),
    
  getDepartmentDistribution: () => 
    apiClient.get<DepartmentDistribution[]>("/dashboard/distribution/department"),
    
  getRecentActivity: () => 
    apiClient.get<RecentActivity[]>("/dashboard/recent-activity"),
    
  getTodayAppointments: () => 
    apiClient.get<AppointmentResponseDto[]>("/dashboard/today-appointments"),
    
  getRecentPatients: () => 
    apiClient.get<PatientDto[]>("/dashboard/recent-patients"),
};
