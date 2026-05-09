package org.hms.medica.admission.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hms.medica.common.entity.AuditedEntity;
import org.hms.medica.doctor.model.Doctor;
import org.hms.medica.patient.model.Patient;
import org.hms.medica.ward.model.Ward;

import java.time.LocalDate;

@Entity
@Table(name = "admissions")
@Getter
@Setter
public class Admission extends AuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ward_id")
    private Ward ward;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdmissionType admissionType;

    @Column(nullable = false)
    private String diagnosisOnAdmission;

    private String diagnosisOnDischarge;

    @Column(nullable = false)
    private LocalDate admissionDate;

    private LocalDate expectedDischargeDate;
    private LocalDate actualDischargeDate;
}
