package org.hms.medica.payment.repository;

import org.hms.medica.payment.model.Bill;
import org.hms.medica.payment.model.BillStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByKbPaymentId(String kbPaymentId);
    boolean existsByKbPaymentIdAndStatusNot(String kbPaymentId, BillStatus status);
    Page<Bill> findByAppointmentPatientEmail(String email, Pageable pageable);
}
