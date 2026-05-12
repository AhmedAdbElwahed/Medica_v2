package org.hms.medica.ward.mapper;

import org.hms.medica.ward.dto.CreateWardRequest;
import org.hms.medica.ward.dto.UpdateWardRequest;
import org.hms.medica.ward.dto.WardResponse;
import org.hms.medica.ward.model.Ward;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface WardMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "doctors", ignore = true)
    Ward toEntity(CreateWardRequest request);

    @Mapping(target = "currentPatientCount", ignore = true)
    @Mapping(target = "occupancyRate", ignore = true)
    WardResponse toResponse(Ward ward);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "doctors", ignore = true)
    void updateEntityFromRequest(UpdateWardRequest request, @MappingTarget Ward ward);
}
