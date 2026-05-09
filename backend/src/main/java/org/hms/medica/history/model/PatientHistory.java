package org.hms.medica.history.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hms.medica.common.entity.AuditedEntity;
import org.hms.medica.patient.model.Patient;

@Entity
@Table(name = "patient_histories")
@Getter
@Setter
public class PatientHistory extends AuditedEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private String medicalConditions;
    private String allergies;
    private String pastSurgeries;
    private String familyMedicalHistory;

    private boolean hasPastOrtho;
    private boolean hasFamOrtho;

    @Column(columnDefinition = "TEXT")
    private String additionalNotes;
}
