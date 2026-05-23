package org.hms.medica.admission.service;

import org.hms.medica.admission.dto.AdmissionResponse;
import org.hms.medica.admission.dto.CreateAdmissionRequest;
import org.hms.medica.admission.dto.DischargeAdmissionRequest;
import org.hms.medica.common.dto.PageResponse;
import org.springframework.data.domain.Pageable;

public interface AdmissionService {
    AdmissionResponse createAdmission(CreateAdmissionRequest request);
    PageResponse<AdmissionResponse> getAdmissions(Pageable pageable);
    AdmissionResponse getAdmissionById(Long id);
    AdmissionResponse dischargePatient(Long id, DischargeAdmissionRequest request);
}
