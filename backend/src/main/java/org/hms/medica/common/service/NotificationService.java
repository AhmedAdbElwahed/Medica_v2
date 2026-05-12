package org.hms.medica.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hms.medica.payment.model.Bill;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final EmailService emailService;

    public void notifyPaymentConfirmed(Bill bill) {
        log.info("Notifying payment confirmed for bill: {}", bill.getId());
        // TODO: Implement email sending via emailService
    }

    public void notifyPaymentFailed(Bill bill) {
        log.info("Notifying payment failed for bill: {}", bill.getId());
        // TODO: Implement email sending via emailService
    }
}
