package com.adlerian;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AdlerianApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdlerianApplication.class, args);
    }
}
