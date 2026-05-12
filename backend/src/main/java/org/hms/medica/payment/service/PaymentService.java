package org.hms.medica.payment.service;

import org.hms.medica.common.dto.PageResponse;
import org.hms.medica.payment.dto.BillResponse;
import org.springframework.data.domain.Pageable;

public interface PaymentService {
    BillResponse initiatePayment(Long appointmentId, Long currentUserId);
    void processKillBillNotification(String notificationJson);
    PageResponse<BillResponse> getBillsByPatientEmail(String email, Pageable pageable);
    BillResponse getById(Long id);
    PageResponse<BillResponse> getAllBills(Pageable pageable);
    BillResponse refund(Long id);
}
