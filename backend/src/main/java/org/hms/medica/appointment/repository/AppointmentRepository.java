package org.hms.medica.appointment.repository;

import org.hms.medica.appointment.model.Appointment;
import org.hms.medica.appointment.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long>, QuerydslPredicateExecutor<Appointment> {
    List<Appointment> findByDoctorIdAndStartTimeBetween(Long doctorId, LocalDateTime start, LocalDateTime end);

    Optional<Appointment> findByDoctorIdAndStartTimeAndStatusNot(Long doctorId, LocalDateTime startTime, AppointmentStatus status);

    Optional<Appointment> findByPatientIdAndStartTimeAndStatusNot(Long patientId, LocalDateTime startTime, AppointmentStatus status);

    long countByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    List<Appointment> findAllByStartTimeBetween(LocalDateTime start, LocalDateTime end);
}
