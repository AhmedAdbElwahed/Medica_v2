package org.hms.medica.ward.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.hms.medica.admission.repository.AdmissionRepository;
import org.hms.medica.common.dto.PageResponse;
import org.hms.medica.ward.dto.CreateWardRequest;
import org.hms.medica.ward.dto.UpdateWardRequest;
import org.hms.medica.ward.dto.WardResponse;
import org.hms.medica.ward.mapper.WardMapper;
import org.hms.medica.ward.model.Ward;
import org.hms.medica.ward.repository.WardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class WardServiceImpl implements WardService {

    private final WardRepository wardRepository;
    private final WardMapper wardMapper;
    private final AdmissionRepository admissionRepository;

    @Override
    public WardResponse createWard(CreateWardRequest request) {
        Ward ward = wardMapper.toEntity(request);
        return mapToResponse(wardRepository.save(ward));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<WardResponse> getWards(Pageable pageable) {
        Page<Ward> page = wardRepository.findAll(pageable);
        return PageResponse.of(page.map(this::mapToResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public WardResponse getWardById(Long id) {
        return wardRepository.findById(id)
            .map(this::mapToResponse)
            .orElseThrow(() -> new EntityNotFoundException("Ward not found with id: " + id));
    }

    @Override
    public WardResponse updateWard(Long id, UpdateWardRequest request) {
        Ward ward = wardRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ward not found with id: " + id));
        wardMapper.updateEntityFromRequest(request, ward);
        return mapToResponse(wardRepository.save(ward));
    }

    @Override
    public void deleteWard(Long id) {
        if (!wardRepository.existsById(id)) {
            throw new EntityNotFoundException("Ward not found with id: " + id);
        }
        wardRepository.deleteById(id);
    }

    @Override
    public WardResponse toggleLock(Long id) {
        Ward ward = wardRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ward not found with id: " + id));
        ward.setLocked(!ward.isLocked());
        return mapToResponse(wardRepository.save(ward));
    }

    @Override
    public WardResponse toggleActive(Long id) {
        Ward ward = wardRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ward not found with id: " + id));
        ward.setActive(!ward.isActive());
        return mapToResponse(wardRepository.save(ward));
    }

    private WardResponse mapToResponse(Ward ward) {
        long currentPatientCount = admissionRepository.countActiveAdmissionsInWard(ward.getId());
        double occupancyRate = ward.getNumberOfBeds() > 0 
            ? (double) currentPatientCount / ward.getNumberOfBeds() * 100 
            : 0;
        
        WardResponse response = wardMapper.toResponse(ward);
        return new WardResponse(
            response.id(), response.name(), response.phoneNumber(), response.email(),
            response.numberOfBeds(), response.numberOfNurses(), response.genderDesignation(),
            response.active(), response.locked(), currentPatientCount, occupancyRate
        );
    }
}
