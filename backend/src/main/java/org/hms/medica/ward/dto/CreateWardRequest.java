package org.hms.medica.ward.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hms.medica.ward.model.WardGender;

public record CreateWardRequest(
    @NotBlank String name,
    String phoneNumber,
    String email,
    @Min(1) int numberOfBeds,
    @Min(0) int numberOfNurses,
    @NotNull WardGender genderDesignation,
    boolean active,
    boolean locked
) {}
