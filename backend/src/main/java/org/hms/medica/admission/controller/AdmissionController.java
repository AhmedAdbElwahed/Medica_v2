package org.hms.medica.admission.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hms.medica.admission.dto.AdmissionResponse;
import org.hms.medica.admission.dto.CreateAdmissionRequest;
import org.hms.medica.admission.dto.DischargeAdmissionRequest;
import org.hms.medica.admission.service.AdmissionService;
import org.hms.medica.common.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hms/v1/admissions")
@RequiredArgsConstructor
public class AdmissionController {

    private final AdmissionService admissionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdmissionResponse> createAdmission(@Valid @RequestBody CreateAdmissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(admissionService.createAdmission(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<PageResponse<AdmissionResponse>> getAdmissions(Pageable pageable) {
        return ResponseEntity.ok(admissionService.getAdmissions(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<AdmissionResponse> getAdmissionById(@PathVariable Long id) {
        return ResponseEntity.ok(admissionService.getAdmissionById(id));
    }

    @PutMapping("/{id}/discharge")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdmissionResponse> dischargePatient(
            @PathVariable Long id,
            @Valid @RequestBody DischargeAdmissionRequest request) {
        return ResponseEntity.ok(admissionService.dischargePatient(id, request));
    }
}
