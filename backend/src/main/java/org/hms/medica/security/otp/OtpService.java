package org.hms.medica.security.otp;

import lombok.RequiredArgsConstructor;
import org.hms.medica.common.exception.BusinessRuleViolationException;
import org.hms.medica.user.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final OtpRepository otpRepository;
    
    private static final int OTP_LENGTH = 6;
    private static final long OTP_EXPIRY_MINUTES = 10;
    private static final String ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    @Transactional
    public Otp createOtp(User user) {
        // Invalidate previous OTPs for this user    
        otpRepository.invalidateAllForUser(user.getId());

        String code = generateCode();
        Otp otp = new Otp();
        otp.setUser(user);
        otp.setCode(code);
        otp.setExpiresAt(Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        return otpRepository.save(otp);
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();    
        StringBuilder sb = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++)
            sb.append(ALPHANUMERIC.charAt(random.nextInt(ALPHANUMERIC.length())));
        return sb.toString();
    }

    public Otp validateOtp(String email, String code) {
        return otpRepository
            .findValidOtp(email, code, Instant.now())
            .orElseThrow(() -> new BusinessRuleViolationException("Invalid or expired OTP"));
    }
}
