package org.hms.medica.admission.mapper;

import org.hms.medica.admission.dto.AdmissionResponse;
import org.hms.medica.admission.model.Admission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AdmissionMapper {

    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "patientName", expression = "java(admission.getPatient().getFirstName() + \" \" + admission.getPatient().getLastName())")
    @Mapping(target = "doctorId", source = "doctor.id")
    @Mapping(target = "doctorName", expression = "java(\"Dr. \" + admission.getDoctor().getFirstName() + \" \" + admission.getDoctor().getLastName())")
    @Mapping(target = "wardId", source = "ward.id")
    @Mapping(target = "wardName", source = "ward.name")
    @Mapping(target = "status", expression = "java(admission.getActualDischargeDate() == null ? \"ACTIVE\" : \"DISCHARGED\")")
    AdmissionResponse toResponse(Admission admission);
}
