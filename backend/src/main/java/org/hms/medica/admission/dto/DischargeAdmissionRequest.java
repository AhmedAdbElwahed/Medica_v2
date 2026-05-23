package org.hms.medica.admission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record DischargeAdmissionRequest(
    @NotBlank(message = "Diagnosis on discharge is required")
    String diagnosisOnDischarge,

    @NotNull(message = "Actual discharge date is required")
    LocalDate actualDischargeDate
) {}
