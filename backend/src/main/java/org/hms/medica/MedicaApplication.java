package org.hms.medica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.Optional;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class MedicaApplication {

	public static void main(String[] args) {
		SpringApplication.run(MedicaApplication.class, args);
	}

	@Bean
	public AuditorAware<String> auditorProvider() {
		// TODO: Integrate with Spring Security to return current username
		return () -> Optional.of("system");
	}

}
