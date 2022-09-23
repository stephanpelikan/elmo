package at.elmo;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import at.elmo.car.CarProperties;
import at.elmo.config.ElmoProperties;
import at.elmo.config.TranslationProperties;
import at.elmo.reservation.passangerservice.PassangerServiceProperties;
import at.elmo.util.email.EmailProperties;
import at.elmo.util.sms.SmsProperties;
import at.phactum.bp.blueprint.modules.ModuleAndWorkerAwareSpringApplication;

@SpringBootApplication
@ComponentScan(basePackages = "at.elmo")
@EnableConfigurationProperties({
        ElmoProperties.class,
        TranslationProperties.class,
        EmailProperties.class,
        SmsProperties.class,
        CarProperties.class,
        PassangerServiceProperties.class
    })
public class ElmoApplication {

    public static void main(String... args) {

        new ModuleAndWorkerAwareSpringApplication(ElmoApplication.class).run(args);

    }

}
