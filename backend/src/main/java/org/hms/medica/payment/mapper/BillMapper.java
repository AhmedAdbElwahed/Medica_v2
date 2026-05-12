package org.hms.medica.payment.mapper;

import org.hms.medica.payment.dto.BillResponse;
import org.hms.medica.payment.model.Bill;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BillMapper {

    @Mapping(target = "appointmentId", source = "appointment.id")
    @Mapping(target = "patientName", expression = "java(bill.getAppointment().getPatient().getFirstName() + \" \" + bill.getAppointment().getPatient().getLastName())")
    @Mapping(target = "doctorName", expression = "java(bill.getAppointment().getDoctor().getFirstName() + \" \" + bill.getAppointment().getDoctor().getLastName())")
    @Mapping(target = "appointmentTime", source = "appointment.startTime")
    BillResponse toResponse(Bill bill);
}
