package org.hms.medica.security.otp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    
    @Query("SELECT o FROM Otp o WHERE o.user.email = :email AND o.code = :code AND o.used = false AND o.expiresAt > :now")
    Optional<Otp> findValidOtp(String email, String code, Instant now);

    @Modifying
    @Query("UPDATE Otp o SET o.used = true WHERE o.user.id = :userId")
    void invalidateAllForUser(Long userId);
    
    Optional<Otp> findByCode(String code);
}
