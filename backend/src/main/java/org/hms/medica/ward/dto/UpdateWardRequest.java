package org.hms.medica.ward.dto;

import org.hms.medica.ward.model.WardGender;

public record UpdateWardRequest(
    String name,
    String phoneNumber,
    String email,
    Integer numberOfBeds,
    Integer numberOfNurses,
    WardGender genderDesignation,
    Boolean active,
    Boolean locked
) {}
