package org.hms.medica.admission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hms.medica.admission.model.AdmissionType;

import java.time.LocalDate;

public record CreateAdmissionRequest(
    @NotNull(message = "Patient ID is required")
    Long patientId,

    @NotNull(message = "Doctor ID is required")
    Long doctorId,

    @NotNull(message = "Ward ID is required")
    Long wardId,

    @NotNull(message = "Admission type is required")
    AdmissionType admissionType,

    @NotBlank(message = "Diagnosis on admission is required")
    String diagnosisOnAdmission,

    @NotNull(message = "Admission date is required")
    LocalDate admissionDate,

    LocalDate expectedDischargeDate
) {}
