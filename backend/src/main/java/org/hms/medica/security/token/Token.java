package org.hms.medica.security.token;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hms.medica.common.entity.BaseEntity;
import org.hms.medica.user.model.User;

@Entity
@Table(name = "tokens")
@Getter
@Setter
public class Token extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "TEXT")
    private String tokenValue;

    @Enumerated(EnumType.STRING)
    private TokenType type;

    private boolean expired = false;
    private boolean revoked = false;
}
