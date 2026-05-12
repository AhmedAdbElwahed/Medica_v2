package org.hms.medica.payment.dto;

import org.hms.medica.payment.model.BillStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record BillResponse(
        Long id,
        Long appointmentId,
        String patientName,
        String doctorName,
        LocalDateTime appointmentTime,
        Long amount,
        BillStatus status,
        String kbInvoiceId,
        Instant paidAt
) {}
