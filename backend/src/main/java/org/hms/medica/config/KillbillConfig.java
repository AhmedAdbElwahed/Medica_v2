package org.hms.medica.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "killbill")
@Data
public class KillbillConfig {
    private String url;
    private String username;
    private String password;
    private String apiKey;
    private String apiSecret;
    private String paymentPlugin;
    private String currency;
    private String notificationUrl;
}
