package org.hms.medica.ward.service;

import org.hms.medica.common.dto.PageResponse;
import org.hms.medica.ward.dto.CreateWardRequest;
import org.hms.medica.ward.dto.UpdateWardRequest;
import org.hms.medica.ward.dto.WardResponse;
import org.springframework.data.domain.Pageable;

public interface WardService {
    WardResponse createWard(CreateWardRequest request);
    PageResponse<WardResponse> getWards(Pageable pageable);
    WardResponse getWardById(Long id);
    WardResponse updateWard(Long id, UpdateWardRequest request);
    void deleteWard(Long id);
    WardResponse toggleLock(Long id);
    WardResponse toggleActive(Long id);
}
