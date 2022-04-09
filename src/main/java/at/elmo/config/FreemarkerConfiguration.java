package at.elmo.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;
import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean;

import freemarker.cache.TemplateLookupStrategy;
import freemarker.template.TemplateException;

@Configuration
public class FreemarkerConfiguration {

    public static final String EMAIL_TEMPLATES = "email";
    @Autowired
    private ElmoProperties properties;
    
    @Value("${spring.freemarker.template-loader-path}")
    private String templateLoaderPath;
    
    @Bean
    @Qualifier(EMAIL_TEMPLATES)
    public FreeMarkerConfigurationFactoryBean freemarkerConfig(
            final ResourceLoader resourceLoader) throws Exception {

        final var result = new FreeMarkerConfigurationFactoryBean() {

            @Override
            protected freemarker.template.Configuration newConfiguration() throws IOException, TemplateException {
                
                return new freemarker.template.Configuration(
                        freemarker.template.Configuration.VERSION_2_3_31);
                
            }
            
            @Override
            protected void postProcessConfiguration(
                    final freemarker.template.Configuration config) throws IOException, TemplateException {

                config.setTemplateLookupStrategy(TemplateLookupStrategy.DEFAULT_2_3_0);
                config.setLocalizedLookup(true);
                config.setRecognizeStandardFileExtensions(true);

                final var elmoInformation = new ElmoInformation();
                elmoInformation.setTitle(properties.getTitle());
                elmoInformation.setGatewayUrl(properties.getGatewayUrl());
                elmoInformation.setHomepage(properties.getHomepage());
                elmoInformation.setEmailSender(properties.getEmailSender());
                config.setSharedVariable("elmo", elmoInformation);

            }

        };
        
        result.setTemplateLoaderPath(templateLoaderPath);
        
        return result;
        
    }

    public static class ElmoInformation {

        private String title;

        private String gatewayUrl;

        private String homepage;

        private String emailSender;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getGatewayUrl() {
            return gatewayUrl;
        }

        public void setGatewayUrl(String gatewayUrl) {
            this.gatewayUrl = gatewayUrl;
        }

        public String getHomepage() {
            return homepage;
        }

        public void setHomepage(String homepage) {
            this.homepage = homepage;
        }

        public String getEmailSender() {
            return emailSender;
        }

        public void setEmailSender(String emailSender) {
            this.emailSender = emailSender;
        }

    }
    
}
