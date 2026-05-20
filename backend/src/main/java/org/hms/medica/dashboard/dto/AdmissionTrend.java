package org.hms.medica.dashboard.dto;

public record AdmissionTrend(
    String period,
    long count
) {}
