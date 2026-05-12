package org.hms.medica.doctor.dto;

import org.hms.medica.doctor.model.Specialty;
import org.hms.medica.user.model.Gender;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

public record DoctorResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    Gender gender,
    LocalDate dateOfBirth,
    String phoneNumber,
    Specialty specialty,
    String education,
    String certifications,
    int yearsOfExperience,
    String licenseNumber,
    LocalTime workStartTime,
    LocalTime workEndTime,
    Set<DayOfWeek> workingDays,
    boolean activeStatus,
    Long wardId,
    String wardName
) {}
