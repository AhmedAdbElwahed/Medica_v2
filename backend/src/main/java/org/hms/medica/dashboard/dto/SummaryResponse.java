package org.hms.medica.dashboard.dto;

import java.time.LocalDateTime;

public record SummaryResponse(
    long totalPatients,
    long todayAppointments,
    long activeAdmissions,
    double wardEfficiencyRate
) {}
