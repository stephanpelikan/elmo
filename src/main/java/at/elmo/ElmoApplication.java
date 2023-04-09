package at.elmo;

import at.elmo.car.CarProperties;
import at.elmo.config.ElmoProperties;
import at.elmo.config.TranslationProperties;
import at.elmo.reservation.carsharing.CarSharingProperties;
import at.elmo.reservation.passengerservice.PassengerServiceProperties;
import at.elmo.util.email.EmailProperties;
import at.elmo.util.sms.SmsProperties;
import io.vanillabp.springboot.ModuleAndWorkerAwareSpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan(basePackages = "at.elmo")
@EnableConfigurationProperties({
        ElmoProperties.class,
        TranslationProperties.class,
        EmailProperties.class,
        SmsProperties.class,
        CarProperties.class,
        PassengerServiceProperties.class,
        CarSharingProperties.class
    })
@EnableAsync
@EnableScheduling
public class ElmoApplication {

    public static void main(String... args) {

        new ModuleAndWorkerAwareSpringApplication(ElmoApplication.class).run(args);

    }

}
