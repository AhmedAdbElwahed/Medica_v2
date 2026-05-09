package org.hms.medica.security;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hms.medica.security.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hms/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {


    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterRequest request) {
        authService.registerPatient(request);        
    }

    @GetMapping("/activate/{otp}")
    public void activate(@PathVariable String otp) { 
        authService.activateAccount(otp);
    }

    @PostMapping("/resend-otp")
    public void resendOtp(@RequestParam String email) {
        authService.resendActivationOtp(email);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestHeader("Authorization") String authHeader) {      
        return ResponseEntity.ok(authService.refreshToken(authHeader));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public void logout(@RequestHeader("Authorization") String authHeader) {
        authService.logout(authHeader); 
    }

    @PostMapping("/password/reset/request")
    public void requestReset(@RequestParam String email) {
        authService.requestPasswordReset(email);     
    }

    @PostMapping("/password/reset/confirm")
    public void confirmReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
        authService.confirmPasswordReset(request);   
    }

    @PostMapping("/admin/password/reset")
    @PreAuthorize("hasRole('ADMIN')")
    public void adminReset(@Valid @RequestBody AdminPasswordResetRequest request) {
        authService.adminForceResetPassword(request);
    }
}
