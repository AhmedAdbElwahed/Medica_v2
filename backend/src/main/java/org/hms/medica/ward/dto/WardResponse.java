package org.hms.medica.ward.dto;

import org.hms.medica.ward.model.WardGender;

public record WardResponse(
    Long id,
    String name,
    String phoneNumber,
    String email,
    int numberOfBeds,
    int numberOfNurses,
    WardGender genderDesignation,
    boolean active,
    boolean locked,
    long currentPatientCount,
    double occupancyRate
) {}
