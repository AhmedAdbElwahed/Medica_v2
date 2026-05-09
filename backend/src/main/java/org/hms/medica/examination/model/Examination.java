package org.hms.medica.examination.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hms.medica.admission.model.Admission;
import org.hms.medica.common.entity.AuditedEntity;
import org.hms.medica.doctor.model.Doctor;
import org.hms.medica.patient.model.Patient;

import java.time.LocalDateTime;

@Entity
@Table(name = "examinations")
@Getter
@Setter
public class Examination extends AuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admission_id")
    private Admission admission;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    private LocalDateTime examinationDate;

    private Double heartRate;
    private Double temperature;
    private Double oxygenSaturation;
    private Double weight;
    private Double height;
    private Double urineOutput;

    @Enumerated(EnumType.STRING)
    private BowelMovement bowelMovement;

    @Enumerated(EnumType.STRING)
    private AuscultationFinding auscultation;
}
