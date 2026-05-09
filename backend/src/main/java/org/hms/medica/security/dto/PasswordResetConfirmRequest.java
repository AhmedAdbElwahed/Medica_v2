package org.hms.medica.security.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordResetConfirmRequest(
    @Email @NotBlank String email,
    @NotBlank String otp,
    @Size(min = 8) @NotBlank String newPassword      
) {}
