package org.hms.medica.patient.mapper;

import org.hms.medica.patient.dto.CreatePatientRequest;
import org.hms.medica.patient.dto.PatientResponse;
import org.hms.medica.patient.dto.UpdatePatientRequest;
import org.hms.medica.patient.model.Patient;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", constant = "ROLE_PATIENT")
    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "tokens", ignore = true)
    @Mapping(target = "history", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    @Mapping(target = "admissions", ignore = true)
    @Mapping(target = "diagnoses", ignore = true)
    @Mapping(target = "examinations", ignore = true)
    @Mapping(target = "medications", ignore = true)
    @Mapping(target = "password", ignore = true) // Encoded in service
    Patient toEntity(CreatePatientRequest request);

    PatientResponse toResponse(Patient patient);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    @Mapping(target = "tokens", ignore = true)
    @Mapping(target = "history", ignore = true)
    @Mapping(target = "appointments", ignore = true)
    @Mapping(target = "admissions", ignore = true)
    @Mapping(target = "diagnoses", ignore = true)
    @Mapping(target = "examinations", ignore = true)
    @Mapping(target = "medications", ignore = true)
    void updateEntityFromRequest(UpdatePatientRequest request, @MappingTarget Patient patient);
}
