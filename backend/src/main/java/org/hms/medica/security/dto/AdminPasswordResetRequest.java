package org.hms.medica.security.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;

public record AdminPasswordResetRequest(
    @NotNull Long userId,
    @Size(min = 8) @NotBlank String newPassword      
) {}
