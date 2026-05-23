package org.hms.medica.admission.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.hms.medica.admission.dto.AdmissionResponse;
import org.hms.medica.admission.dto.CreateAdmissionRequest;
import org.hms.medica.admission.dto.DischargeAdmissionRequest;
import org.hms.medica.admission.mapper.AdmissionMapper;
import org.hms.medica.admission.model.Admission;
import org.hms.medica.admission.repository.AdmissionRepository;
import org.hms.medica.common.dto.PageResponse;
import org.hms.medica.doctor.model.Doctor;
import org.hms.medica.doctor.repository.DoctorRepository;
import org.hms.medica.patient.model.Patient;
import org.hms.medica.patient.repository.PatientRepository;
import org.hms.medica.ward.model.Ward;
import org.hms.medica.ward.repository.WardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdmissionServiceImpl implements AdmissionService {

    private final AdmissionRepository admissionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final WardRepository wardRepository;
    private final AdmissionMapper admissionMapper;

    @Override
    public AdmissionResponse createAdmission(CreateAdmissionRequest request) {
        Patient patient = patientRepository.findById(request.patientId())
            .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + request.patientId()));

        Doctor doctor = doctorRepository.findById(request.doctorId())
            .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + request.doctorId()));

        Ward ward = wardRepository.findById(request.wardId())
            .orElseThrow(() -> new EntityNotFoundException("Ward not found with id: " + request.wardId()));

        // Capacity Guards
        if (ward.isLocked()) {
            throw new IllegalStateException("Admission is rejected: Ward '" + ward.getName() + "' is locked.");
        }
        if (!ward.isActive()) {
            throw new IllegalStateException("Admission is rejected: Ward '" + ward.getName() + "' is currently inactive.");
        }

        long currentOccupancy = admissionRepository.countActiveAdmissionsInWard(ward.getId());
        if (currentOccupancy >= ward.getNumberOfBeds()) {
            throw new IllegalStateException("Admission is rejected: Ward '" + ward.getName() + "' is at maximum capacity (" + ward.getNumberOfBeds() + " beds).");
        }

        Admission admission = new Admission();
        admission.setPatient(patient);
        admission.setDoctor(doctor);
        admission.setWard(ward);
        admission.setAdmissionType(request.admissionType());
        admission.setDiagnosisOnAdmission(request.diagnosisOnAdmission());
        admission.setAdmissionDate(request.admissionDate());
        admission.setExpectedDischargeDate(request.expectedDischargeDate());

        return admissionMapper.toResponse(admissionRepository.save(admission));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdmissionResponse> getAdmissions(Pageable pageable) {
        Page<Admission> page = admissionRepository.findAll(pageable);
        return PageResponse.of(page.map(admissionMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public AdmissionResponse getAdmissionById(Long id) {
        return admissionRepository.findById(id)
            .map(admissionMapper::toResponse)
            .orElseThrow(() -> new EntityNotFoundException("Admission not found with id: " + id));
    }

    @Override
    public AdmissionResponse dischargePatient(Long id, DischargeAdmissionRequest request) {
        Admission admission = admissionRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Admission not found with id: " + id));

        if (admission.getActualDischargeDate() != null) {
            throw new IllegalStateException("Patient is already discharged from this admission.");
        }

        admission.setDiagnosisOnDischarge(request.diagnosisOnDischarge());
        admission.setActualDischargeDate(request.actualDischargeDate());

        return admissionMapper.toResponse(admissionRepository.save(admission));
    }
}
