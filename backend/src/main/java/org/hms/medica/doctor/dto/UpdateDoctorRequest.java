package org.hms.medica.doctor.dto;

import org.hms.medica.doctor.model.Specialty;
import org.hms.medica.user.model.Gender;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

public record UpdateDoctorRequest(
    String firstName,
    String lastName,
    Gender gender,
    LocalDate dateOfBirth,
    String phoneNumber,
    String address,
    String nationality,
    Specialty specialty,
    String education,
    String certifications,
    Integer yearsOfExperience,
    String licenseNumber,
    LocalTime workStartTime,
    LocalTime workEndTime,
    Set<DayOfWeek> workingDays,
    Long wardId
) {}
