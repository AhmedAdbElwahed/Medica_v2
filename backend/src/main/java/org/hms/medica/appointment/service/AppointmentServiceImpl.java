package org.hms.medica.appointment.service;

import com.querydsl.core.BooleanBuilder;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.hms.medica.appointment.dto.*;
import org.hms.medica.appointment.mapper.AppointmentMapper;
import org.hms.medica.appointment.model.Appointment;
import org.hms.medica.appointment.model.AppointmentStatus;
import org.hms.medica.appointment.model.QAppointment;
import org.hms.medica.appointment.repository.AppointmentRepository;
import org.hms.medica.common.dto.PageResponse;
import org.hms.medica.common.exception.BusinessRuleViolationException;
import org.hms.medica.doctor.model.Doctor;
import org.hms.medica.doctor.repository.DoctorRepository;
import org.hms.medica.patient.model.Patient;
import org.hms.medica.patient.repository.PatientRepository;
import org.hms.medica.user.model.Role;
import org.hms.medica.user.model.User;
import org.hms.medica.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentValidator appointmentValidator;
    private final AppointmentMapper appointmentMapper;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    private static final long DEFAULT_FEE = 20000; // 200.00 EGP in piasters

    @Override
    @Transactional
    public AppointmentResponse bookOwnAppointment(BookAppointmentRequest request, String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with email: " + email));

        Doctor doctor = doctorRepository.findById(request.doctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + request.doctorId()));

        appointmentValidator.validate(doctor, patient, request.startTime());

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setStartTime(request.startTime());
        appointment.setReasonForVisit(request.reasonForVisit());
        appointment.setVirtual(request.virtual());
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setFeeAmount(DEFAULT_FEE);

        return appointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public AppointmentResponse bookOnBehalf(AdminBookAppointmentRequest request) {
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + request.patientId()));

        Doctor doctor = doctorRepository.findById(request.doctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + request.doctorId()));

        appointmentValidator.validate(doctor, patient, request.startTime());

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setStartTime(request.startTime());
        appointment.setReasonForVisit(request.reasonForVisit());
        appointment.setVirtual(request.virtual());
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setFeeAmount(request.feeAmount() != null ? request.feeAmount() : DEFAULT_FEE);

        return appointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AppointmentResponse> getAppointments(AppointmentFilter filter, Pageable pageable) {
        BooleanBuilder builder = new BooleanBuilder();
        QAppointment appointment = QAppointment.appointment;

        if (filter.getDoctorId() != null) {
            builder.and(appointment.doctor.id.eq(filter.getDoctorId()));
        }
        if (filter.getPatientId() != null) {
            builder.and(appointment.patient.id.eq(filter.getPatientId()));
        }
        if (filter.getDate() != null) {
            LocalDateTime start = filter.getDate().atStartOfDay();
            LocalDateTime end = filter.getDate().atTime(LocalTime.MAX);
            builder.and(appointment.startTime.between(start, end));
        }
        if (filter.getStatus() != null) {
            builder.and(appointment.status.eq(filter.getStatus()));
        }
        if (filter.getPaid() != null) {
            builder.and(appointment.paid.eq(filter.getPaid()));
        }
        if (filter.getVirtual() != null) {
            builder.and(appointment.virtual.eq(filter.getVirtual()));
        }

        Page<Appointment> page = appointmentRepository.findAll(builder, pageable);
        return PageResponse.of(page.map(appointmentMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getById(Long id, String currentEmail) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + id));

        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + currentEmail));

        // Ownership check for PATIENT
        if (currentUser.getRole() == Role.ROLE_PATIENT && !appointment.getPatient().getEmail().equals(currentEmail)) {
            throw new AccessDeniedException("You can only access your own appointments");
        }

        return appointmentMapper.toResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AppointmentResponse> getMyAppointments(String email, Pageable pageable) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with email: " + email));

        QAppointment appointment = QAppointment.appointment;
        Page<Appointment> page = appointmentRepository.findAll(appointment.patient.id.eq(patient.getId()), pageable);
        return PageResponse.of(page.map(appointmentMapper::toResponse));
    }

    @Override
    @Transactional
    public AppointmentResponse changeStatus(Long id, ChangeStatusRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + id));

        appointment.setStatus(request.status());
        return appointmentMapper.toResponse(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public void cancelOwnAppointment(Long id, String email) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + id));

        if (!appointment.getPatient().getEmail().equals(email)) {
            throw new AccessDeniedException("You can only cancel your own appointments");
        }

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new BusinessRuleViolationException("Only pending appointments can be cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELED);
        appointmentRepository.save(appointment);
    }

    @Override
    @Transactional
    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new EntityNotFoundException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }
}
