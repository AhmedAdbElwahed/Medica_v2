package org.hms.medica.security;

import lombok.RequiredArgsConstructor;
import org.hms.medica.common.exception.BusinessRuleViolationException;
import org.hms.medica.common.service.EmailService;
import org.hms.medica.patient.model.Patient;
import org.hms.medica.patient.repository.PatientRepository;
import org.hms.medica.security.dto.*;
import org.hms.medica.security.jwt.JwtService;
import org.hms.medica.security.otp.Otp;
import org.hms.medica.security.otp.OtpRepository;
import org.hms.medica.security.otp.OtpService;
import org.hms.medica.security.token.Token;
import org.hms.medica.security.token.TokenRepository;
import org.hms.medica.security.token.TokenType;
import org.hms.medica.user.model.Role;
import org.hms.medica.user.model.User;
import org.hms.medica.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final OtpRepository otpRepository;
    private final TokenRepository tokenRepository;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;

    @Override
    @Transactional
    public void registerPatient(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessRuleViolationException("Email already taken");
        }

        Patient patient = new Patient();
        patient.setFirstName(request.firstName());
        patient.setLastName(request.lastName());
        patient.setEmail(request.email());
        patient.setPassword(passwordEncoder.encode(request.password()));
        patient.setRole(Role.ROLE_PATIENT);
        patient.setEnabled(false);

        patientRepository.save(patient);

        Otp otp = otpService.createOtp(patient);
        emailService.sendEmail(patient.getEmail(), "Account Activation", 
                "Your activation code is: " + otp.getCode());
    }

    @Override
    @Transactional
    public void activateAccount(String otpCode) {
        Otp otp = otpRepository.findByCode(otpCode)
                .orElseThrow(() -> new BusinessRuleViolationException("Invalid OTP"));

        if (otp.isUsed() || otp.getExpiresAt().isBefore(java.time.Instant.now())) {
            throw new BusinessRuleViolationException("OTP expired or already used");
        }

        User user = otp.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        otp.setUsed(true);
        otpRepository.save(otp);
    }

    @Override
    public void resendActivationOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessRuleViolationException("User not found"));
        
        if (user.isEnabled()) {
            throw new BusinessRuleViolationException("Account already activated");
        }

        Otp otp = otpService.createOtp(user);
        emailService.sendEmail(user.getEmail(), "Account Activation", 
                "Your new activation code is: " + otp.getCode());
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email()).orElseThrow();
        if (!user.isEnabled()) {
            throw new BusinessRuleViolationException("Please verify your email");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);

        return new AuthResponse(jwtToken, refreshToken);
    }

    @Override
    public AuthResponse refreshToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BusinessRuleViolationException("Invalid refresh token");
        }
        String refreshToken = authHeader.substring(7);
        String userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            if (jwtService.isTokenValid(refreshToken, userDetails)) {
                String accessToken = jwtService.generateToken(userDetails);
                User user = userRepository.findByEmail(userEmail).orElseThrow();
                revokeAllUserTokens(user);
                saveUserToken(user, accessToken);
                return new AuthResponse(accessToken, refreshToken);
            }
        }
        throw new BusinessRuleViolationException("Invalid refresh token");
    }

    @Override
    public void logout(String authHeader) {
        // Handled by LogoutService, but can be called manually
    }

    @Override
    @Transactional
    public void requestPasswordReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            Otp otp = otpService.createOtp(user);
            emailService.sendEmail(user.getEmail(), "Password Reset", 
                    "Your password reset code is: " + otp.getCode());
        });
    }

    @Override
    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        Otp otp = otpService.validateOtp(request.email(), request.otp());
        User user = otp.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        otp.setUsed(true);
        otpRepository.save(otp);

        revokeAllUserTokens(user);
    }

    @Override
    @Transactional
    public void adminForceResetPassword(AdminPasswordResetRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new BusinessRuleViolationException("User not found"));
        
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        revokeAllUserTokens(user);
    }

    private void saveUserToken(User user, String jwtToken) {
        Token token = new Token();
        token.setUser(user);
        token.setTokenValue(jwtToken);
        token.setType(TokenType.BEARER);
        token.setExpired(false);
        token.setRevoked(false);
        tokenRepository.save(token);
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokensByUser(user.getId());
        if (validUserTokens.isEmpty())
            return;
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }
}
