package org.hms.medica.dashboard.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.hms.medica.appointment.dto.AppointmentResponse;
import org.hms.medica.dashboard.dto.*;
import org.hms.medica.dashboard.service.DashboardService;
import org.hms.medica.patient.dto.PatientResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/hms/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<SummaryResponse> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/trends/admissions")
    public ResponseEntity<List<AdmissionTrend>> getAdmissionTrends() {
        return ResponseEntity.ok(dashboardService.getAdmissionTrends());
    }

    @GetMapping("/distribution/department")
    public ResponseEntity<List<DepartmentDistribution>> getDepartmentDistribution() {
        return ResponseEntity.ok(dashboardService.getDepartmentDistribution());
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<RecentActivity>> getRecentActivity() {
        return ResponseEntity.ok(dashboardService.getRecentActivity());
    }

    @GetMapping("/today-appointments")
    public ResponseEntity<List<AppointmentResponse>> getTodayAppointments() {
        return ResponseEntity.ok(dashboardService.getTodayAppointments());
    }

    @GetMapping("/recent-patients")
    public ResponseEntity<List<PatientResponse>> getRecentPatients() {
        return ResponseEntity.ok(dashboardService.getRecentPatients());
    }

    @GetMapping("/statistics")
    public ResponseEntity<Object> getStatistics() {
        return ResponseEntity.ok().build();
    }
}
