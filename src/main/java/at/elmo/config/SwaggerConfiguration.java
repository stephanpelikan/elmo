package at.elmo.config;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

/**
 * Enable swagger UI.
 */
@Configuration
@EnableSwagger2
public class SwaggerConfiguration implements WebMvcConfigurer {

    /**
     * Define GUI API.
     */
    @Bean
    @ConditionalOnExpression("#{(systemProperties['swagger.gui.enable'] ?: 'false') == 'true'}")
    public Docket produceGuiSwaggerApi(@Value("${spring.application.name:application}") String appName) {

        ApiInfo apiInfo = new ApiInfo(
                "GUI API (microservice '" + StringUtils.capitalize(appName) + "')",
                "GUI API",
                "1.0",
                "",
                ApiInfo.DEFAULT_CONTACT,
                "",
                "",
                new ArrayList<>()
        );

        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo)
                .useDefaultResponseMessages(true)
                .groupName("GUI")
                .select()
                .apis(RequestHandlerSelectors.basePackage("at.elmo.api.gui"))
                .paths(PathSelectors.ant("/api/**"))
                .build();

    }

    /**
     * Defines how to serve static resources of Swagger UI.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("swagger-ui.html").addResourceLocations("classpath:/META-INF/resources/");
        registry.addResourceHandler("/webjars/**").addResourceLocations("classpath:/META-INF/resources/webjars/");

    }

}
