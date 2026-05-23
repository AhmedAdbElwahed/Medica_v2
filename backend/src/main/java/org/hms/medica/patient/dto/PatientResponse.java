package org.hms.medica.patient.dto;

import org.hms.medica.patient.model.BloodType;
import org.hms.medica.patient.model.MaritalStatus;
import org.hms.medica.user.model.Gender;

import java.time.Instant;
import java.time.LocalDate;

public record PatientResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    Gender gender,
    LocalDate dateOfBirth,
    String phoneNumber,
    String address,
    String nationality,
    String profilePhotoUrl,
    BloodType bloodType,
    MaritalStatus maritalStatus,
    String insurancePolicyNumber,
    boolean enabled,
    Instant createdAt
) {}
