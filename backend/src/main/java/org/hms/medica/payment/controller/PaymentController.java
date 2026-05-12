package org.hms.medica.payment.controller;

import lombok.RequiredArgsConstructor;
import org.hms.medica.common.dto.PageResponse;
import org.hms.medica.payment.dto.BillResponse;
import org.hms.medica.payment.service.PaymentService;
import org.hms.medica.user.model.User;
import org.hms.medica.user.repository.UserRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hms/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    @PostMapping("/initiate/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<BillResponse> initiatePayment(
            @PathVariable Long appointmentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(paymentService.initiatePayment(appointmentId, user.getId()));
    }

    @PostMapping("/killbill-notification")
    public ResponseEntity<Void> handleKillBillNotification(@RequestBody String notificationJson) {
        paymentService.processKillBillNotification(notificationJson);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/bills")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PageResponse<BillResponse>> getMyBills(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(paymentService.getBillsByPatientEmail(userDetails.getUsername(), pageable));
    }

    @GetMapping("/bills/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BillResponse> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getById(id));
    }

    @GetMapping("/bills/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<BillResponse>> getAllBills(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(paymentService.getAllBills(pageable));
    }

    @PostMapping("/bills/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BillResponse> refund(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.refund(id));
    }
}
