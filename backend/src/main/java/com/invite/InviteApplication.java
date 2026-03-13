package com.invite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InviteApplication {
    public static void main(String[] args) {
        SpringApplication.run(InviteApplication.class, args);
    }
}
