package org.hms.medica.appointment.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hms.medica.common.entity.AuditedEntity;
import org.hms.medica.doctor.model.Doctor;
import org.hms.medica.patient.model.Patient;
import org.hms.medica.payment.model.Bill;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "doctor_id", "startTime" }),
        @UniqueConstraint(columnNames = { "patient_id", "startTime" })
})
@Getter
@Setter
public class Appointment extends AuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private String reasonForVisit;

    private boolean virtual = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    private boolean paid = false;

    @Column(nullable = false)
    private Long feeAmount;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL)
    private Bill bill;
}
