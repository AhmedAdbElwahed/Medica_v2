package org.hms.medica.doctor.mapper;

import org.hms.medica.doctor.dto.CreateDoctorRequest;
import org.hms.medica.doctor.dto.DoctorResponse;
import org.hms.medica.doctor.dto.UpdateDoctorRequest;
import org.hms.medica.doctor.model.Doctor;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DoctorMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", constant = "ROLE_DOCTOR")
    @Mapping(target = "activeStatus", constant = "true")
    @Mapping(target = "enabled", constant = "true")
    @Mapping(target = "tokens", ignore = true)
    @Mapping(target = "ward", ignore = true) // Handled in service
    @Mapping(target = "password", ignore = true) // Encoded in service
    Doctor toEntity(CreateDoctorRequest request);

    @Mapping(target = "wardId", source = "ward.id")
    @Mapping(target = "wardName", source = "ward.name")
    DoctorResponse toResponse(Doctor doctor);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    @Mapping(target = "tokens", ignore = true)
    @Mapping(target = "ward", ignore = true) // Handled in service
    void updateEntityFromRequest(UpdateDoctorRequest request, @MappingTarget Doctor doctor);
}
