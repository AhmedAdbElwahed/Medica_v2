package org.hms.medica.admission.dto;

import org.hms.medica.admission.model.AdmissionType;

import java.time.LocalDate;

public record AdmissionResponse(
    Long id,
    Long patientId,
    String patientName,
    Long doctorId,
    String doctorName,
    Long wardId,
    String wardName,
    AdmissionType admissionType,
    String diagnosisOnAdmission,
    String diagnosisOnDischarge,
    LocalDate admissionDate,
    LocalDate expectedDischargeDate,
    LocalDate actualDischargeDate,
    String status
) {}
