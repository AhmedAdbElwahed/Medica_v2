package org.hms.medica.dashboard.service;

import org.hms.medica.appointment.dto.AppointmentResponse;
import org.hms.medica.dashboard.dto.*;
import org.hms.medica.patient.dto.PatientResponse;

import java.util.List;

public interface DashboardService {
    SummaryResponse getSummary();
    List<AdmissionTrend> getAdmissionTrends();
    List<DepartmentDistribution> getDepartmentDistribution();
    List<RecentActivity> getRecentActivity();
    List<AppointmentResponse> getTodayAppointments();
    List<PatientResponse> getRecentPatients();
}
