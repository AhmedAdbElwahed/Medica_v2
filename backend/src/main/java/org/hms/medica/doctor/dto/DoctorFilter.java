package org.hms.medica.doctor.dto;

import lombok.Data;
import org.hms.medica.doctor.model.Specialty;

@Data
public class DoctorFilter {
    private String name;
    private String firstName;
    private String lastName;
    private Specialty specialty;
    private Boolean activeStatus;
}
