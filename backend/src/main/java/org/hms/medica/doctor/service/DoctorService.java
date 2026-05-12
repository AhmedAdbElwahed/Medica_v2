package org.hms.medica.doctor.service;

import org.hms.medica.common.dto.PageResponse;
import org.hms.medica.doctor.dto.CreateDoctorRequest;
import org.hms.medica.doctor.dto.DoctorResponse;
import org.hms.medica.doctor.dto.UpdateDoctorRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.hms.medica.doctor.dto.DoctorFilter;

public interface DoctorService {
    DoctorResponse createDoctor(CreateDoctorRequest request);
    PageResponse<DoctorResponse> getDoctors(DoctorFilter filter, Pageable pageable);
    DoctorResponse getDoctorById(Long id);
    DoctorResponse updateDoctor(Long id, UpdateDoctorRequest request);
    void deleteDoctor(Long id);
    DoctorResponse toggleActiveStatus(Long id);
    List<LocalTime> getAvailableSlots(Long doctorId, LocalDate date);
    List<DoctorResponse> searchDoctors(String query);
    DoctorResponse getMyProfile(String email);
}
