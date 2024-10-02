package mogether.mogether;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.Objects;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class MogetherApplication {

	public static void main(String[] args) {
		SpringApplication.run(MogetherApplication.class, args);
	}
}
