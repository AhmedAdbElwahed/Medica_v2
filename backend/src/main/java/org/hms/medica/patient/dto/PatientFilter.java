package org.hms.medica.patient.dto;

import lombok.Data;
import org.hms.medica.patient.model.BloodType;
import org.hms.medica.patient.model.MaritalStatus;

@Data
public class PatientFilter {
    private String firstName;
    private String lastName;
    private BloodType bloodType;
    private MaritalStatus maritalStatus;
    private Boolean enabled;
}
