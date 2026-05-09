package org.hms.medica.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "security.jwt")
@Data
public class JwtConfig {
    private String secretKey;
    private long accessTokenExpiry;
    private long refreshTokenExpiry;
}
