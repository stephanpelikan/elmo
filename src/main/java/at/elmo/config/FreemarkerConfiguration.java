package at.elmo.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;
import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean;

import at.elmo.util.email.EmailProperties;
import freemarker.cache.TemplateLookupStrategy;
import freemarker.template.TemplateException;

@Configuration
public class FreemarkerConfiguration {

    public static final String EMAIL_TEMPLATES = "email";

    public static final String SMS_TEMPLATES = "sms";

    @Autowired
    private ElmoProperties properties;
    
    @Autowired
    private EmailProperties emailProperties;

    @Value("${spring.freemarker.template-loader-path}")
    private String templateLoaderPath;
    
    @Bean
    @Qualifier(EMAIL_TEMPLATES)
    public FreeMarkerConfigurationFactoryBean freemarkerEmailConfig(
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

                final var elmoInformation = new ElmoEmailInformation();
                elmoInformation.setTitle(properties.getTitleLong());
                elmoInformation.setGatewayUrl(properties.getGatewayUrl());
                elmoInformation.setHomepage(properties.getHomepageUrl());
                elmoInformation.setEmailSender(emailProperties.getSender());
                elmoInformation.setPhoneNumber(properties.getTransportServicePhoneNumber());
                elmoInformation.setGeneralEmailAddress(properties.getGeneralEmailAddress());
                config.setSharedVariable("elmo", elmoInformation);

            }

        };
        
        result.setTemplateLoaderPath(templateLoaderPath + "/email");
        
        return result;
        
    }

    public static class ElmoEmailInformation {

        private String title;

        private String gatewayUrl;

        private String homepage;

        private String emailSender;

        private String phoneNumber;

        private String generalEmailAddress;

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

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public String getGeneralEmailAddress() {
            return generalEmailAddress;
        }

        public void setGeneralEmailAddress(String generalEmailAddress) {
            this.generalEmailAddress = generalEmailAddress;
        }

    }

    
    @Bean
    @Qualifier(SMS_TEMPLATES)
    public FreeMarkerConfigurationFactoryBean freemarkerSmsConfig(
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

                final var elmoInformation = new ElmoSmsInformation();
                elmoInformation.setTitle(properties.getTitleShort());
                elmoInformation.setGatewayUrl(properties.getGatewayUrl());
                elmoInformation.setHomepage(properties.getHomepageUrl());
                config.setSharedVariable("elmo", elmoInformation);

            }

        };
        
        result.setTemplateLoaderPath(templateLoaderPath + "/sms");
        
        return result;
        
    }

    public static class ElmoSmsInformation {

        private String title;

        private String gatewayUrl;

        private String homepage;

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

    }
    
}
