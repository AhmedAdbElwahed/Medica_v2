package org.hms.medica.appointment.dto;

import org.hms.medica.appointment.model.AppointmentStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        Long patientId,
        String patientName,
        Long doctorId,
        String doctorName,
        String doctorSpecialty,
        LocalDateTime startTime,
        String reasonForVisit,
        boolean virtual,
        AppointmentStatus status,
        boolean paid,
        Long feeAmount,
        Instant createdAt
) {}
