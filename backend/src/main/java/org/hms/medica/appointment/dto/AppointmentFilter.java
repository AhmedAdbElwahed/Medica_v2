package org.hms.medica.appointment.dto;

import lombok.Data;
import org.hms.medica.appointment.model.AppointmentStatus;

import java.time.LocalDate;

@Data
public class AppointmentFilter {
    private Long doctorId;
    private Long patientId;
    private LocalDate date;
    private AppointmentStatus status;
    private Boolean paid;
    private Boolean virtual;
}
