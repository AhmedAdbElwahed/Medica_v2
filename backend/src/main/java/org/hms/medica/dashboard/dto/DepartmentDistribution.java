package org.hms.medica.dashboard.dto;

public record DepartmentDistribution(
    String wardName,
    long patientCount,
    double percentage
) {}
