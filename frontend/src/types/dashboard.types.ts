export interface SummaryResponse {
  totalPatients: number;
  todayAppointments: number;
  activeAdmissions: number;
  wardEfficiencyRate: number;
}

export interface AdmissionTrend {
  period: string;
  count: number;
}

export interface DepartmentDistribution {
  wardName: string;
  patientCount: number;
  percentage: number;
}

export interface RecentActivity {
  type: "ADMISSION" | "APPOINTMENT" | "REGISTRATION" | "DISCHARGE";
  description: string;
  timestamp: string;
}
