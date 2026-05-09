package org.hms.medica.payment.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hms.medica.appointment.model.Appointment;
import org.hms.medica.common.entity.AuditedEntity;

import java.time.Instant;

@Entity
@Table(name = "bills")
@Getter
@Setter
public class Bill extends AuditedEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    private BillStatus status = BillStatus.UNPAID;

    private String stripeSessionId;
    private Instant paidAt;
}
