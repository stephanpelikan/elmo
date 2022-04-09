package at.elmo;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;

import at.elmo.config.ElmoProperties;
import at.phactum.bp.blueprint.modules.ModuleAndWorkerAwareSpringApplication;

@SpringBootApplication
@ComponentScan(basePackages = "at.elmo")
@EnableConfigurationProperties({ ElmoProperties.class })
public class ElmoApplication {

    public static void main(String... args) {

        new ModuleAndWorkerAwareSpringApplication(ElmoApplication.class).run(args);

    }

}
