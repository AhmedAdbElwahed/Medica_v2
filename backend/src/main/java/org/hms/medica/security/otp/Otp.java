package org.hms.medica.security.otp;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hms.medica.common.entity.BaseEntity;
import org.hms.medica.user.model.User;

import java.time.Instant;

@Entity
@Table(name = "otps")
@Getter
@Setter
public class Otp extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String code;
    private Instant expiresAt;
    private boolean used = false;
}
