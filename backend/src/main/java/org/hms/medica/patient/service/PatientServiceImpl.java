package org.hms.medica.patient.service;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.hms.medica.common.dto.PageResponse;
import org.hms.medica.patient.dto.CreatePatientRequest;
import org.hms.medica.patient.dto.PatientFilter;
import org.hms.medica.patient.dto.PatientResponse;
import org.hms.medica.patient.dto.UpdatePatientRequest;
import org.hms.medica.patient.mapper.PatientMapper;
import org.hms.medica.patient.model.Patient;
import org.hms.medica.patient.model.QPatient;
import org.hms.medica.patient.repository.PatientRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.hms.medica.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PatientMapper patientMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public PatientResponse createPatient(CreatePatientRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }
        Patient patient = patientMapper.toEntity(request);
        patient.setPassword(passwordEncoder.encode(request.password()));
        return patientMapper.toResponse(patientRepository.save(patient));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PatientResponse> getPatients(PatientFilter filter, Pageable pageable) {
        Predicate predicate = buildPredicate(filter);
        Page<Patient> page = patientRepository.findAll(predicate, pageable);
        return PageResponse.of(page.map(patientMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long id) {
        return patientRepository.findById(id)
            .map(patientMapper::toResponse)
            .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + id));
    }

    @Override
    public PatientResponse updatePatient(Long id, UpdatePatientRequest request) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + id));
        patientMapper.updateEntityFromRequest(request, patient);
        return patientMapper.toResponse(patientRepository.save(patient));
    }

    @Override
    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new EntityNotFoundException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getMyProfile(String email) {
        return patientRepository.findByEmail(email)
            .map(patientMapper::toResponse)
            .orElseThrow(() -> new EntityNotFoundException("Patient not found with email: " + email));
    }

    @Override
    public PatientResponse updateMyProfile(String email, UpdatePatientRequest request) {
        Patient patient = patientRepository.findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Patient not found with email: " + email));
        patientMapper.updateEntityFromRequest(request, patient);
        return patientMapper.toResponse(patientRepository.save(patient));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponse> searchPatients(String fullName) {
        QPatient qPatient = QPatient.patient;
        String[] parts = fullName.split(" ");
        BooleanBuilder builder = new BooleanBuilder();
        for (String part : parts) {
            builder.and(qPatient.firstName.containsIgnoreCase(part)
                .or(qPatient.lastName.containsIgnoreCase(part)));
        }
        return StreamSupport.stream(patientRepository.findAll(builder).spliterator(), false)
            .map(patientMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponse> getRecentlyRegistered() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        QPatient qPatient = QPatient.patient;
        Predicate predicate = qPatient.createdAt.after(thirtyDaysAgo);
        return StreamSupport.stream(patientRepository.findAll(predicate).spliterator(), false)
            .map(patientMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponse> getEstablishedPatients() {
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        QPatient qPatient = QPatient.patient;
        Predicate predicate = qPatient.createdAt.before(thirtyDaysAgo);
        return StreamSupport.stream(patientRepository.findAll(predicate).spliterator(), false)
            .map(patientMapper::toResponse)
            .collect(Collectors.toList());
    }

    private Predicate buildPredicate(PatientFilter filter) {
        QPatient qPatient = QPatient.patient;
        BooleanBuilder builder = new BooleanBuilder();

        if (filter.getFirstName() != null) {
            builder.and(qPatient.firstName.containsIgnoreCase(filter.getFirstName()));
        }
        if (filter.getLastName() != null) {
            builder.and(qPatient.lastName.containsIgnoreCase(filter.getLastName()));
        }
        if (filter.getBloodType() != null) {
            builder.and(qPatient.bloodType.eq(filter.getBloodType()));
        }
        if (filter.getMaritalStatus() != null) {
            builder.and(qPatient.maritalStatus.eq(filter.getMaritalStatus()));
        }
        if (filter.getEnabled() != null) {
            builder.and(qPatient.enabled.eq(filter.getEnabled()));
        }

        return builder;
    }
}
