package org.hms.medica.appointment.service;

import org.hms.medica.appointment.dto.*;
import org.hms.medica.common.dto.PageResponse;
import org.springframework.data.domain.Pageable;

public interface AppointmentService {
    AppointmentResponse bookOwnAppointment(BookAppointmentRequest request, String email);
    AppointmentResponse bookOnBehalf(AdminBookAppointmentRequest request);
    PageResponse<AppointmentResponse> getAppointments(AppointmentFilter filter, Pageable pageable);
    AppointmentResponse getById(Long id, String currentEmail);
    PageResponse<AppointmentResponse> getMyAppointments(String email, Pageable pageable);
    AppointmentResponse changeStatus(Long id, ChangeStatusRequest request);
    void cancelOwnAppointment(Long id, String email);
    void deleteAppointment(Long id);
}
