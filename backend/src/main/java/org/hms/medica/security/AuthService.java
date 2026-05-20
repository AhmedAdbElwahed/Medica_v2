package org.hms.medica.security;

import org.hms.medica.security.dto.*;

public interface AuthService {
    void registerPatient(RegisterRequest request);   
    void activateAccount(String otp);
    void resendActivationOtp(String email);
    AuthResponse login(LoginRequest request);        
    AuthResponse refreshToken(RefreshTokenRequest request);  
    void logout(String authHeader);
    void requestPasswordReset(String email);
    void confirmPasswordReset(PasswordResetConfirmRequest request);
    void adminForceResetPassword(AdminPasswordResetRequest request);
}
