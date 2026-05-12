package org.hms.medica.patient.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hms.medica.patient.model.BloodType;
import org.hms.medica.patient.model.MaritalStatus;
import org.hms.medica.user.model.Gender;

import java.time.LocalDate;

public record CreatePatientRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @Email @NotBlank String email,
    @NotBlank String password,
    @NotNull Gender gender,
    @NotNull LocalDate dateOfBirth,
    @NotBlank String phoneNumber,
    String address,
    String nationality,
    @NotNull BloodType bloodType,
    @NotNull MaritalStatus maritalStatus,
    String insurancePolicyNumber
) {}
