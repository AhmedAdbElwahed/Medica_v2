package org.hms.medica.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hms.medica.appointment.model.Appointment;
import org.hms.medica.appointment.repository.AppointmentRepository;
import org.hms.medica.common.dto.PageResponse;
import org.hms.medica.common.exception.BusinessRuleViolationException;
import org.hms.medica.common.service.NotificationService;
import org.hms.medica.config.KillbillConfig;
import org.hms.medica.patient.model.Patient;
import org.hms.medica.payment.dto.BillResponse;
import org.hms.medica.payment.dto.NotificationEvent;
import org.hms.medica.payment.mapper.BillMapper;
import org.hms.medica.payment.model.Bill;
import org.hms.medica.payment.model.BillStatus;
import org.hms.medica.payment.repository.BillRepository;
import org.joda.time.LocalDate;
import org.killbill.billing.catalog.api.Currency;
import org.killbill.billing.client.KillBillClientException;
import org.killbill.billing.client.RequestOptions;
import org.killbill.billing.client.api.gen.AccountApi;
import org.killbill.billing.client.api.gen.InvoiceApi;
import org.killbill.billing.client.api.gen.PaymentApi;
import org.killbill.billing.client.model.InvoiceItems;
import org.killbill.billing.client.model.gen.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final AccountApi accountApi;
    private final InvoiceApi invoiceApi;
    private final PaymentApi paymentApi;
    private final KillbillConfig config;
    private final AppointmentRepository appointmentRepository;
    private final BillRepository billRepository;
    private final BillMapper billMapper;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public BillResponse initiatePayment(Long appointmentId, Long currentUserId) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        if (!appt.getPatient().getId().equals(currentUserId)) {
            throw new AccessDeniedException("Cannot pay for another patient's appointment");
        }

        if (appt.isPaid()) {
            throw new BusinessRuleViolationException("Appointment is already paid");
        }

        Patient patient = appt.getPatient();

        try {
            // Step 1: Get or create Kill Bill account for this patient
            UUID kbAccountId = getOrCreateKillBillAccount(patient);

            // Step 2: Create external charge invoice
            BigDecimal amount = BigDecimal.valueOf(appt.getFeeAmount(), 2); // piasters -> EGP
            InvoiceItem externalCharge = new InvoiceItem();
            externalCharge.setAccountId(kbAccountId);
            externalCharge.setAmount(amount);
            externalCharge.setCurrency(Currency.valueOf(config.getCurrency()));
            externalCharge.setDescription("Appointment with Dr. " + appt.getDoctor().getLastName()
                    + " on " + appt.getStartTime().toLocalDate());

            InvoiceItems invoiceItems = new InvoiceItems();
            invoiceItems.add(externalCharge);

            InvoiceItems items = invoiceApi.createExternalCharges(
                    kbAccountId, invoiceItems, LocalDate.now(),
                    true,
                    null,
                    RequestOptions.builder().withCreatedBy("medica-system").build());

            UUID kbInvoiceId = items.get(0).getInvoiceId();

            // Step 3: Trigger payment on the invoice
            InvoicePayment paymentBody = new InvoicePayment();
            paymentBody.setAccountId(kbAccountId);
            
            InvoicePayment payment = invoiceApi.createInstantPayment(
                    kbInvoiceId,
                    paymentBody,
                    null,
                    null,
                    RequestOptions.builder().withCreatedBy("medica-system").build());

            // Step 4: Persist local Bill record
            Bill bill = new Bill();
            bill.setAppointment(appt);
            bill.setAmount(appt.getFeeAmount());
            bill.setStatus(BillStatus.PENDING);
            bill.setKbInvoiceId(kbInvoiceId.toString());
            bill.setKbPaymentId(payment.getPaymentId().toString());
            bill = billRepository.save(bill);

            log.info("Payment initiated: appointmentId={} kbPaymentId={}", appointmentId, payment.getPaymentId());
            return billMapper.toResponse(bill);
        } catch (KillBillClientException e) {
            log.error("Kill Bill error during payment initiation", e);
            throw new RuntimeException("Failed to initiate payment via Kill Bill", e);
        }
    }

    @Override
    @Transactional
    public void processKillBillNotification(String notificationJson) {
        try {
            NotificationEvent event = objectMapper.readValue(notificationJson, NotificationEvent.class);
            String kbPaymentId = event.getObjectId();
            String eventType = event.getEventType();

            if (billRepository.existsByKbPaymentIdAndStatusNot(kbPaymentId, BillStatus.PENDING)) {
                log.info("Notification already processed for kbPaymentId={}", kbPaymentId);
                return;
            }

            Bill bill = billRepository.findByKbPaymentId(kbPaymentId)
                    .orElseThrow(() -> new EntityNotFoundException("Bill not found for KB payment " + kbPaymentId));

            switch (eventType) {
                case "PAYMENT_SUCCESS" -> {
                    bill.setStatus(BillStatus.PAID);
                    bill.setPaidAt(Instant.now());
                    bill.getAppointment().setPaid(true);
                    appointmentRepository.save(bill.getAppointment());
                    notificationService.notifyPaymentConfirmed(bill);
                }
                case "PAYMENT_FAILED" -> {
                    bill.setStatus(BillStatus.FAILED);
                    notificationService.notifyPaymentFailed(bill);
                }
                case "PAYMENT_REFUND" -> {
                    bill.setStatus(BillStatus.REFUNDED);
                    bill.getAppointment().setPaid(false);
                    appointmentRepository.save(bill.getAppointment());
                }
                default -> log.warn("Unhandled Kill Bill event type: {}", eventType);
            }
            billRepository.save(bill);
        } catch (Exception e) {
            log.error("Error processing Kill Bill notification", e);
        }
    }

    @Override
    public PageResponse<BillResponse> getBillsByPatientEmail(String email, Pageable pageable) {
        Page<Bill> page = billRepository.findByAppointmentPatientEmail(email, pageable);
        return PageResponse.of(page.map(billMapper::toResponse));
    }

    @Override
    public BillResponse getById(Long id) {
        return billRepository.findById(id)
                .map(billMapper::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Bill not found with id: " + id));
    }

    @Override
    public PageResponse<BillResponse> getAllBills(Pageable pageable) {
        Page<Bill> page = billRepository.findAll(pageable);
        return PageResponse.of(page.map(billMapper::toResponse));
    }

    @Override
    @Transactional
    public BillResponse refund(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bill not found with id: " + id));

        if (bill.getStatus() != BillStatus.PAID) {
            throw new BusinessRuleViolationException("Only paid bills can be refunded");
        }

        try {
            // Trigger refund in Kill Bill
            PaymentTransaction refundBody = new PaymentTransaction();
            refundBody.setPaymentId(UUID.fromString(bill.getKbPaymentId()));
            refundBody.setAmount(BigDecimal.valueOf(bill.getAmount(), 2));
            refundBody.setCurrency(Currency.valueOf(config.getCurrency()));

            paymentApi.refundPayment(UUID.fromString(bill.getKbPaymentId()), refundBody,
                    null, null,
                    RequestOptions.builder().withCreatedBy("medica-system").build());

            bill.setStatus(BillStatus.REFUNDED);
            bill.getAppointment().setPaid(false);
            appointmentRepository.save(bill.getAppointment());
            return billMapper.toResponse(billRepository.save(bill));
        } catch (KillBillClientException e) {
            log.error("Kill Bill error during refund", e);
            throw new RuntimeException("Failed to refund payment via Kill Bill", e);
        }
    }

    private UUID getOrCreateKillBillAccount(Patient patient) throws KillBillClientException {
        String externalKey = "patient-" + patient.getId();
        try {
            Account existing = accountApi.getAccountByKey(externalKey, RequestOptions.empty());
            return existing.getAccountId();
        } catch (KillBillClientException e) {
            // Check status code
            if (e.getResponse() != null && e.getResponse().statusCode() == 404) {
                Account account = new Account();
                account.setExternalKey(externalKey);
                account.setName(patient.getFirstName() + " " + patient.getLastName());
                account.setEmail(patient.getEmail());
                account.setCurrency(Currency.valueOf(config.getCurrency()));
                Account created = accountApi.createAccount(account,
                        RequestOptions.builder().withCreatedBy("medica-system").build());
                return created.getAccountId();
            }
            throw e;
        }
    }
}
