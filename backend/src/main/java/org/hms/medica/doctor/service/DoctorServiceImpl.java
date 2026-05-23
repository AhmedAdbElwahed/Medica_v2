package org.hms.medica.doctor.service;

import com.querydsl.core.BooleanBuilder;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.hms.medica.appointment.repository.AppointmentRepository;
import org.hms.medica.common.dto.PageResponse;
import org.hms.medica.common.exception.BusinessRuleViolationException;
import org.hms.medica.doctor.dto.CreateDoctorRequest;
import org.hms.medica.doctor.dto.DoctorResponse;
import org.hms.medica.doctor.dto.UpdateDoctorRequest;
import org.hms.medica.doctor.mapper.DoctorMapper;
import org.hms.medica.doctor.model.Doctor;
import org.hms.medica.doctor.model.QDoctor;
import org.hms.medica.doctor.repository.DoctorRepository;
import org.hms.medica.ward.repository.WardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.hms.medica.doctor.dto.DoctorFilter;
import org.hms.medica.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final DoctorMapper doctorMapper;
    private final PasswordEncoder passwordEncoder;
    private final WardRepository wardRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    public DoctorResponse createDoctor(CreateDoctorRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (doctorRepository.existsByLicenseNumber(request.licenseNumber())) {
            throw new IllegalArgumentException("License number already exists");
        }
        Doctor doctor = doctorMapper.toEntity(request);
        doctor.setPassword(passwordEncoder.encode(request.password()));
        if (request.wardId() != null) {
            doctor.setWard(wardRepository.findById(request.wardId())
                .orElseThrow(() -> new EntityNotFoundException("Ward not found with id: " + request.wardId())));
        }
        return doctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DoctorResponse> getDoctors(DoctorFilter filter, Pageable pageable) {
        QDoctor qDoctor = QDoctor.doctor;
        BooleanBuilder builder = new BooleanBuilder();

        if (filter.getName() != null && !filter.getName().isBlank()) {
            String[] parts = filter.getName().trim().split("\\s+");
            for (String part : parts) {
                builder.and(qDoctor.firstName.containsIgnoreCase(part)
                    .or(qDoctor.lastName.containsIgnoreCase(part)));
            }
        }
        if (filter.getFirstName() != null) {
            builder.and(qDoctor.firstName.containsIgnoreCase(filter.getFirstName()));
        }
        if (filter.getLastName() != null) {
            builder.and(qDoctor.lastName.containsIgnoreCase(filter.getLastName()));
        }
        if (filter.getSpecialty() != null) {
            builder.and(qDoctor.specialty.eq(filter.getSpecialty()));
        }
        if (filter.getActiveStatus() != null) {
            builder.and(qDoctor.activeStatus.eq(filter.getActiveStatus()));
        }

        Page<Doctor> page = doctorRepository.findAll(builder, pageable);
        return PageResponse.of(page.map(doctorMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(Long id) {
        return doctorRepository.findById(id)
            .map(doctorMapper::toResponse)
            .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + id));
    }

    @Override
    public DoctorResponse updateDoctor(Long id, UpdateDoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + id));
        doctorMapper.updateEntityFromRequest(request, doctor);
        if (request.wardId() != null) {
            doctor.setWard(wardRepository.findById(request.wardId())
                .orElseThrow(() -> new EntityNotFoundException("Ward not found with id: " + request.wardId())));
        }
        return doctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Override
    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new EntityNotFoundException("Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
    }

    @Override
    public DoctorResponse toggleActiveStatus(Long id) {
        Doctor doctor = doctorRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + id));
        doctor.setActiveStatus(!doctor.isActiveStatus());
        return doctorMapper.toResponse(doctorRepository.save(doctor));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocalTime> getAvailableSlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + doctorId));

        if (!doctor.isActiveStatus()) {
            throw new BusinessRuleViolationException("Doctor is not currently available");
        }

        if (!doctor.getWorkingDays().contains(date.getDayOfWeek())) {
            return List.of();
        }

        List<LocalTime> allSlots = new ArrayList<>();
        LocalTime cursor = doctor.getWorkStartTime();
        while (cursor.isBefore(doctor.getWorkEndTime())) {
            allSlots.add(cursor);
            cursor = cursor.plusMinutes(30);
        }

        LocalDateTime dayStart = date.atTime(doctor.getWorkStartTime());
        LocalDateTime dayEnd = date.atTime(doctor.getWorkEndTime());
        Set<LocalTime> booked = appointmentRepository
            .findByDoctorIdAndStartTimeBetween(doctorId, dayStart, dayEnd)
            .stream()
            .map(a -> a.getStartTime().toLocalTime())
            .collect(Collectors.toSet());

        LocalTime nowTime = LocalTime.now();
        return allSlots.stream()
            .filter(slot -> !booked.contains(slot))
            .filter(slot -> !date.isEqual(LocalDate.now()) || slot.isAfter(nowTime))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponse> searchDoctors(String query) {
        QDoctor qDoctor = QDoctor.doctor;
        BooleanBuilder builder = new BooleanBuilder();
        String[] parts = query.split(" ");
        for (String part : parts) {
            builder.and(qDoctor.firstName.containsIgnoreCase(part)
                .or(qDoctor.lastName.containsIgnoreCase(part))
                .or(qDoctor.specialty.stringValue().containsIgnoreCase(part)));
        }
        return StreamSupport.stream(doctorRepository.findAll(builder).spliterator(), false)
            .map(doctorMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getMyProfile(String email) {
        return doctorRepository.findByEmail(email)
            .map(doctorMapper::toResponse)
            .orElseThrow(() -> new EntityNotFoundException("Doctor not found with email: " + email));
    }
}
