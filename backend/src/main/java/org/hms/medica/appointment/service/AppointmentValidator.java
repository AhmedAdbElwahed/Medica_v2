package org.hms.medica.appointment.service;

import lombok.RequiredArgsConstructor;
import org.hms.medica.appointment.model.AppointmentStatus;
import org.hms.medica.appointment.repository.AppointmentRepository;
import org.hms.medica.common.exception.BusinessRuleViolationException;
import org.hms.medica.doctor.model.Doctor;
import org.hms.medica.patient.model.Patient;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class AppointmentValidator {

    private final AppointmentRepository appointmentRepository;

    public void validate(Doctor doctor, Patient patient, LocalDateTime startTime) {

        // Rule 1: Doctor must be active
        if (!doctor.isActiveStatus()) {
            throw new BusinessRuleViolationException("Cannot book with inactive doctor");
        }

        // Rule 2: Requested date must be a working day for the doctor
        DayOfWeek requestedDay = startTime.getDayOfWeek();
        if (!doctor.getWorkingDays().contains(requestedDay)) {
            throw new BusinessRuleViolationException("Doctor does not work on " + requestedDay.name());
        }

        // Rule 3: Time must be within doctor's working hours
        LocalTime reqTime = startTime.toLocalTime();
        if (reqTime.isBefore(doctor.getWorkStartTime()) ||
                reqTime.isAfter(doctor.getWorkEndTime().minusMinutes(1))) {
            throw new BusinessRuleViolationException("Appointment time is outside doctor's working hours");
        }

        // Rule 4: Time must be on the hour or half-hour (30-min slots)
        int minute = reqTime.getMinute();
        if (minute != 0 && minute != 30) {
            throw new BusinessRuleViolationException("Appointment must start at :00 or :30");
        }

        // Rule 5: Doctor must not already have a booking at this time
        appointmentRepository
                .findByDoctorIdAndStartTimeAndStatusNot(
                        doctor.getId(), startTime, AppointmentStatus.CANCELED)
                .ifPresent(existing -> {
                    throw new BusinessRuleViolationException("Doctor already has an appointment at this time");
                });

        // Rule 6: Patient must not already have a booking at this time
        appointmentRepository
                .findByPatientIdAndStartTimeAndStatusNot(
                        patient.getId(), startTime, AppointmentStatus.CANCELED)
                .ifPresent(existing -> {
                    throw new BusinessRuleViolationException("You already have an appointment at this time");
                });
    }
}
