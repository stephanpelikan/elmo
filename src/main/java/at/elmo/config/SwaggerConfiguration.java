package at.elmo.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springdoc.core.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Enable swagger UI.
 */
@Configuration
public class SwaggerConfiguration {

    @Autowired
    private ElmoProperties properties;
    
    @Bean
    public OpenAPI springShopOpenAPI(
            @Value("${spring.application.name:application}")
            final String appName) {
        
        return new OpenAPI()
                .info(
                        new Info()
                                .title(appName)
                                .version(properties.getVersion())
                                .license(
                                        new License()
                                                .name("Apache 2.0")
                                                .url("https://github.com/Phactum/elmo#license")))
                                .externalDocs(
                                        new ExternalDocumentation()
                                                .description("Elmo Documentation")
                                                .url("https://github.com/Phactum/elmo"));
        
    }
    
    /**
     * Define GUI API.
     */
    @Bean
    public GroupedOpenApi produceGuiOpenApi() {

        return GroupedOpenApi
                .builder()
                .group("GUI")
                .pathsToMatch("/api/**")
                .build();

    }

}
