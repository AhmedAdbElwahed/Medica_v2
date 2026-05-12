package org.hms.medica.doctor.dto;

import jakarta.validation.constraints.*;
import org.hms.medica.doctor.model.Specialty;
import org.hms.medica.user.model.Gender;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

public record CreateDoctorRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    @Email @NotBlank String email,
    @NotBlank String password,
    @NotNull Gender gender,
    @NotNull LocalDate dateOfBirth,
    @NotBlank String phoneNumber,
    String address,
    String nationality,
    @NotNull Specialty specialty,
    String education,
    String certifications,
    @Min(0) int yearsOfExperience,
    @NotBlank String licenseNumber,
    @NotNull LocalTime workStartTime,
    @NotNull LocalTime workEndTime,
    @NotEmpty Set<DayOfWeek> workingDays,
    Long wardId
) {}
