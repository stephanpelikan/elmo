package at.elmo.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.lang.NonNull;
import org.springframework.web.cors.CorsConfiguration;

import at.elmo.config.websockets.WebsocketProperties;
import at.phactum.bp.blueprint.modules.ModuleSpecificProperties;
import at.phactum.bp.blueprint.modules.WorkflowModuleIdAwareProperties;

@ConfigurationProperties(prefix = "elmo", ignoreUnknownFields = false)
public class ElmoProperties implements WorkflowModuleIdAwareProperties {

    private static final String WORKFLOW_MODULE_ID = "Elmo";

    @Bean
    public static ModuleSpecificProperties moduleProps() {

        return new ModuleSpecificProperties(ElmoProperties.class, WORKFLOW_MODULE_ID);

    }

    @NonNull
    private String title;

    @NonNull
    private String gatewayUrl;

    @NonNull
    private String homepage;

    @NonNull
    private String defaultLocale;

    private CorsConfiguration cors = new CorsConfiguration();

    private WebsocketProperties websockets;

    @NonNull
    private String emailSender;

    private String redirectAllEmailsToAddress;

    private List<String> dontRedirectEmailsToAddresses = List.of();

    public WebsocketProperties getWebsockets() {
        return websockets;
    }

    public void setWebsockets(WebsocketProperties websockets) {
        this.websockets = websockets;
    }

    public CorsConfiguration getCors() {
        return cors;
    }

    public void setCors(CorsConfiguration cors) {
        this.cors = cors;
    }

    public String getGatewayUrl() {
        return gatewayUrl;
    }

    public void setGatewayUrl(String gatewayUrl) {
        this.gatewayUrl = gatewayUrl;
    }

    @Override
    public String getWorkflowModuleId() {
        return WORKFLOW_MODULE_ID;
    }

    public String getRedirectAllEmailsToAddress() {
        return redirectAllEmailsToAddress;
    }

    public void setRedirectAllEmailsToAddress(String redirectAllEmailsToAddress) {
        this.redirectAllEmailsToAddress = redirectAllEmailsToAddress;
    }

    public List<String> getDontRedirectEmailsToAddresses() {
        return dontRedirectEmailsToAddresses;
    }

    public void setDontRedirectEmailsToAddresses(List<String> dontRedirectEmailsToAddresses) {
        this.dontRedirectEmailsToAddresses = dontRedirectEmailsToAddresses;
    }

    public String getEmailSender() {
        return emailSender;
    }

    public void setEmailSender(String emailSender) {
        this.emailSender = emailSender;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getHomepage() {
        return homepage;
    }

    public void setHomepage(String homepage) {
        this.homepage = homepage;
    }

    public String getDefaultLocale() {
        return defaultLocale;
    }

    public void setDefaultLocale(String defaultLocale) {
        this.defaultLocale = defaultLocale;
    }

}
