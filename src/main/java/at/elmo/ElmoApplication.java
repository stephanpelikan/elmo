package at.elmo;

import java.util.HashMap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;

import at.elmo.config.ElmoProperties;

@SpringBootApplication
@ComponentScan(basePackages = "at.elmo")
@EnableConfigurationProperties({ ElmoProperties.class })
public class ElmoApplication {

    @SuppressWarnings("resource")
    public static void main(String... args) {

        final var app = new SpringApplication(ElmoApplication.class);
        setDevelopmentProfileIfNoOthersGiven(app);
        app.run(args);

    }

    private static void setDevelopmentProfileIfNoOthersGiven(final SpringApplication app) {

        final var properties = new HashMap<String, Object>();
        properties.put("spring.profiles.default", "dev");
        app.setDefaultProperties(properties);

    }

}
