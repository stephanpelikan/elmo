package at.elmo.config;

import at.elmo.util.email.EmailProperties;
import freemarker.cache.TemplateLookupStrategy;
import freemarker.template.TemplateException;
import freemarker.template.Version;
import no.api.freemarker.java8.Java8ObjectWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;
import org.springframework.ui.freemarker.FreeMarkerConfigurationFactoryBean;

import java.io.IOException;

@Configuration
public class FreemarkerConfiguration {

    private final static Version FREEMARKER_VERSION = freemarker.template.Configuration.VERSION_2_3_31;
    
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

                return new freemarker.template.Configuration(FREEMARKER_VERSION);

            }

            @Override
            protected void postProcessConfiguration(
                    final freemarker.template.Configuration config) throws IOException, TemplateException {

                config.setTemplateLookupStrategy(TemplateLookupStrategy.DEFAULT_2_3_0);
                config.setLocalizedLookup(true);
                config.setRecognizeStandardFileExtensions(true);
                config.setObjectWrapper(new Java8ObjectWrapper(FREEMARKER_VERSION));

                final var elmoInformation = new ElmoEmailInformation();
                elmoInformation.setTitle(properties.getTitleLong());
                elmoInformation.setShortTitle(properties.getTitleShort());
                elmoInformation.setGatewayUrl(properties.getGatewayUrl());
                elmoInformation.setHomepage(properties.getHomepageUrl());
                elmoInformation.setEmailSender(emailProperties.getSender());
                elmoInformation.setPhoneNumber(properties.getPassengerServicePhoneNumber());
                elmoInformation.setGeneralEmailAddress(properties.getGeneralEmailAddress());
                elmoInformation.setBrandColor(properties.getBrandColor());
                elmoInformation.setAccentColor(properties.getAccentColor());
                config.setSharedVariable("elmo", elmoInformation);

            }

        };

        result.setTemplateLoaderPath(templateLoaderPath + "/email");

        return result;

    }

    public static class ElmoEmailInformation {

        private String title;
        
        private String shortTitle;

        private String gatewayUrl;

        private String homepage;

        private String emailSender;

        private String phoneNumber;

        private String generalEmailAddress;
        
        private String brandColor;
        
        private String accentColor;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getShortTitle() {
            return shortTitle;
        }
        
        public void setShortTitle(String shortTitle) {
            this.shortTitle = shortTitle;
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

        public String getBrandColor() {
            return brandColor;
        }

        public void setBrandColor(String brandColor) {
            this.brandColor = brandColor;
        }

        public String getAccentColor() {
            return accentColor;
        }

        public void setAccentColor(String accentColor) {
            this.accentColor = accentColor;
        }

    }

    @Bean
    @Qualifier(SMS_TEMPLATES)
    public FreeMarkerConfigurationFactoryBean freemarkerSmsConfig(
            final ResourceLoader resourceLoader) throws Exception {

        final var result = new FreeMarkerConfigurationFactoryBean() {

            @Override
            protected freemarker.template.Configuration newConfiguration() throws IOException, TemplateException {

                return new freemarker.template.Configuration(FREEMARKER_VERSION);

            }

            @Override
            protected void postProcessConfiguration(
                    final freemarker.template.Configuration config) throws IOException, TemplateException {

                config.setTemplateLookupStrategy(TemplateLookupStrategy.DEFAULT_2_3_0);
                config.setLocalizedLookup(true);
                config.setRecognizeStandardFileExtensions(true);
                config.setObjectWrapper(new Java8ObjectWrapper(FREEMARKER_VERSION));

                final var elmoInformation = new ElmoSmsInformation();
                elmoInformation.setTitle(properties.getTitleLong());
                elmoInformation.setShortTitle(properties.getTitleShort());
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
        
        private String shortTitle;

        private String gatewayUrl;

        private String homepage;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getShortTitle() {
            return shortTitle;
        }
        
        public void setShortTitle(String shortTitle) {
            this.shortTitle = shortTitle;
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
