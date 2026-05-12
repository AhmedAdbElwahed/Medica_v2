package org.hms.medica.appointment.dto;

import jakarta.validation.constraints.NotNull;
import org.hms.medica.appointment.model.AppointmentStatus;

public record ChangeStatusRequest(
        @NotNull AppointmentStatus status
) {}
