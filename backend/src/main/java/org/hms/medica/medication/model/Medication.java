package org.hms.medica.medication.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hms.medica.common.entity.AuditedEntity;
import org.hms.medica.doctor.model.Doctor;
import org.hms.medica.patient.model.Patient;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "medications")
@Getter
@Setter
public class Medication extends AuditedEntity {

    @Column(nullable = false)
    private String name;

    private String dosage;

    @Enumerated(EnumType.STRING)
    private MedicationFrequency frequency;

    @Enumerated(EnumType.STRING)
    private AdministrationRoute route;

    private String instructions;

    private LocalDate startDate;
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescribed_by_doctor_id")
    private Doctor prescribedBy;

    @ManyToMany(mappedBy = "medications")
    private Set<Patient> patients;
}
