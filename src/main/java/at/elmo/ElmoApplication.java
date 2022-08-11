package at.elmo;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;

import at.elmo.config.ElmoProperties;
import at.elmo.util.email.EmailProperties;
import at.elmo.util.sms.SmsProperties;
import at.phactum.bp.blueprint.modules.ModuleAndWorkerAwareSpringApplication;

@SpringBootApplication
@ComponentScan(basePackages = "at.elmo")
@EnableConfigurationProperties({ ElmoProperties.class, EmailProperties.class, SmsProperties.class })
public class ElmoApplication {

    public static void main(String... args) {

        new ModuleAndWorkerAwareSpringApplication(ElmoApplication.class).run(args);

    }

}
