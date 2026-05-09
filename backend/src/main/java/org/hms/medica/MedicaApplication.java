package org.hms.medica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MedicaApplication {

	public static void main(String[] args) {
		SpringApplication.run(MedicaApplication.class, args);
	}

}
