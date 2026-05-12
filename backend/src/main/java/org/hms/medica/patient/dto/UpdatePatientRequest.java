package org.hms.medica.patient.dto;

import org.hms.medica.patient.model.BloodType;
import org.hms.medica.patient.model.MaritalStatus;
import org.hms.medica.user.model.Gender;

import java.time.LocalDate;

public record UpdatePatientRequest(
    String firstName,
    String lastName,
    Gender gender,
    LocalDate dateOfBirth,
    String phoneNumber,
    String address,
    String nationality,
    BloodType bloodType,
    MaritalStatus maritalStatus,
    String insurancePolicyNumber
) {}
