package org.hms.medica.config;

import lombok.Data;
import org.killbill.billing.client.KillBillHttpClient;
import org.killbill.billing.client.api.gen.AccountApi;
import org.killbill.billing.client.api.gen.InvoiceApi;
import org.killbill.billing.client.api.gen.InvoicePaymentApi;
import org.killbill.billing.client.api.gen.PaymentApi;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
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

    @Bean
    public KillBillHttpClient killBillHttpClient() {
        return new KillBillHttpClient(url, username, password, apiKey, apiSecret);
    }

    @Bean
    public AccountApi accountApi(KillBillHttpClient httpClient) {
        return new AccountApi(httpClient);
    }

    @Bean
    public InvoiceApi invoiceApi(KillBillHttpClient httpClient) {
        return new InvoiceApi(httpClient);
    }

    @Bean
    public InvoicePaymentApi invoicePaymentApi(KillBillHttpClient httpClient) {
        return new InvoicePaymentApi(httpClient);
    }

    @Bean
    public PaymentApi paymentApi(KillBillHttpClient httpClient) {
        return new PaymentApi(httpClient);
    }
}
