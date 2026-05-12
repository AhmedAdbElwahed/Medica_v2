package org.hms.medica.patient.service;

import org.hms.medica.common.dto.PageResponse;
import org.hms.medica.patient.dto.CreatePatientRequest;
import org.hms.medica.patient.dto.PatientFilter;
import org.hms.medica.patient.dto.PatientResponse;
import org.hms.medica.patient.dto.UpdatePatientRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PatientService {
    PatientResponse createPatient(CreatePatientRequest request);
    PageResponse<PatientResponse> getPatients(PatientFilter filter, Pageable pageable);
    PatientResponse getPatientById(Long id);
    PatientResponse updatePatient(Long id, UpdatePatientRequest request);
    void deletePatient(Long id);
    PatientResponse getMyProfile(String email);
    PatientResponse updateMyProfile(String email, UpdatePatientRequest request);
    List<PatientResponse> searchPatients(String fullName);
    List<PatientResponse> getRecentlyRegistered();
    List<PatientResponse> getEstablishedPatients();
}
