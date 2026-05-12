package org.hms.medica.appointment.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AdminBookAppointmentRequest(
        @NotNull Long patientId,
        @NotNull Long doctorId,
        @NotNull @Future LocalDateTime startTime,
        @NotBlank String reasonForVisit,
        boolean virtual,
        @Min(0) Long feeAmount
) {}
