package at.elmo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.web.cors.CorsConfiguration;

import at.elmo.config.websockets.WebsocketProperties;

@ConfigurationProperties(prefix = "elmo", ignoreUnknownFields = false)
public class ElmoProperties {

    private String gatewayUrl;

    private CorsConfiguration cors = new CorsConfiguration();

    private WebsocketProperties websockets;

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

}
