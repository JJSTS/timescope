package es.timescope;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TimescopeApplication {

    public static void main(String[] args) {
        SpringApplication.run(TimescopeApplication.class, args);
    }

}
