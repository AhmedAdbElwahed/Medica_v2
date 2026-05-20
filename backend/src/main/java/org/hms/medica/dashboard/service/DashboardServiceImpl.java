package org.hms.medica.dashboard.service;

import lombok.RequiredArgsConstructor;
import org.hms.medica.admission.repository.AdmissionRepository;
import org.hms.medica.appointment.dto.AppointmentResponse;
import org.hms.medica.appointment.repository.AppointmentRepository;
import org.hms.medica.appointment.mapper.AppointmentMapper;
import org.hms.medica.dashboard.dto.*;
import org.hms.medica.patient.dto.PatientResponse;
import org.hms.medica.patient.repository.PatientRepository;
import org.hms.medica.patient.mapper.PatientMapper;
import org.hms.medica.ward.repository.WardRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final AdmissionRepository admissionRepository;
    private final WardRepository wardRepository;
    private final AppointmentMapper appointmentMapper;
    private final PatientMapper patientMapper;

    @Override
    public SummaryResponse getSummary() {
        long totalPatients = patientRepository.count();
        
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        long todayAppointments = appointmentRepository.countByStartTimeBetween(startOfDay, endOfDay);
        
        long activeAdmissions = admissionRepository.countByActualDischargeDateIsNull();
        
        // Simple mock for efficiency rate
        double efficiencyRate = 85.5; 
        
        return new SummaryResponse(totalPatients, todayAppointments, activeAdmissions, efficiencyRate);
    }

    @Override
    public List<AdmissionTrend> getAdmissionTrends() {
        // Mocking trends for the last 7 days
        List<AdmissionTrend> trends = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            trends.add(new AdmissionTrend(date.toString(), 2L + i % 3));
        }
        return trends;
    }

    @Override
    public List<DepartmentDistribution> getDepartmentDistribution() {
        return wardRepository.findAll().stream()
                .map(ward -> new DepartmentDistribution(ward.getName(), 5L, 20.0))
                .limit(5)
                .collect(Collectors.toList());
    }

    @Override
    public List<RecentActivity> getRecentActivity() {
        List<RecentActivity> activities = new ArrayList<>();
        activities.add(new RecentActivity("REGISTRATION", "New patient registered: John Doe", LocalDateTime.now().minusHours(2)));
        activities.add(new RecentActivity("APPOINTMENT", "Appointment scheduled for Sarah Smith", LocalDateTime.now().minusHours(5)));
        activities.add(new RecentActivity("ADMISSION", "Patient admitted to Ward A: Michael Brown", LocalDateTime.now().minusDays(1)));
        return activities;
    }

    @Override
    public List<AppointmentResponse> getTodayAppointments() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        return appointmentRepository.findAllByStartTimeBetween(startOfDay, endOfDay).stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PatientResponse> getRecentPatients() {
        // Just return the last 5 patients for now
        return patientRepository.findAll().stream()
                .sorted((p1, p2) -> p2.getId().compareTo(p1.getId()))
                .limit(5)
                .map(patientMapper::toResponse)
                .collect(Collectors.toList());
    }
}
