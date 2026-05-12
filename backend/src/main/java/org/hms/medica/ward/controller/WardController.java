package org.hms.medica.ward.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hms.medica.common.dto.PageResponse;
import org.hms.medica.ward.dto.CreateWardRequest;
import org.hms.medica.ward.dto.UpdateWardRequest;
import org.hms.medica.ward.dto.WardResponse;
import org.hms.medica.ward.service.WardService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hms/v1/wards")
@RequiredArgsConstructor
public class WardController {

    private final WardService wardService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WardResponse> createWard(@Valid @RequestBody CreateWardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(wardService.createWard(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<PageResponse<WardResponse>> getWards(Pageable pageable) {
        return ResponseEntity.ok(wardService.getWards(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<WardResponse> getWardById(@PathVariable Long id) {
        return ResponseEntity.ok(wardService.getWardById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WardResponse> updateWard(
            @PathVariable Long id,
            @Valid @RequestBody UpdateWardRequest request) {
        return ResponseEntity.ok(wardService.updateWard(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteWard(@PathVariable Long id) {
        wardService.deleteWard(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WardResponse> toggleLock(@PathVariable Long id) {
        return ResponseEntity.ok(wardService.toggleLock(id));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WardResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(wardService.toggleActive(id));
    }
}
