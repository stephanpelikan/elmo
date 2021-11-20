package at.elmo.config.websockets;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import at.elmo.config.ElmoProperties;

@Configuration
@EnableWebSocketMessageBroker
public class WebsocketConfiguration implements WebSocketMessageBrokerConfigurer {

    public static final String IP_ADDRESS = "IP_ADDRESS";
    
    public static final String SESSION_ID = "sessionId";
    
    @Autowired
    private ElmoProperties properties;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        WebsocketProperties websocketProperties = properties.getWebsockets();

    	// allowed pathes for topics
        config.enableSimpleBroker("/topic", "/user");
        // define at which position user-channels have to be extended by the user-context:
        // /user/queue/auth -> /user/ABCDEFGHIJ/queue/auth
        config.setUserDestinationPrefix("/user/");
        config.configureBrokerChannel().taskExecutor()
            .maxPoolSize(websocketProperties.getMessageBrokerMaxPoolSize())
            .corePoolSize(websocketProperties.getMessageBrokerCorePoolSize())
            .queueCapacity(websocketProperties.getMessageBrokerQueueCapacity());

    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {

        WebsocketProperties websocketProperties = properties.getWebsockets();
        registration.taskExecutor()
            .maxPoolSize(websocketProperties.getInBoundChannelMaxPoolSize())
            .corePoolSize(websocketProperties.getInBoundChannelCorePoolSize())
            .queueCapacity(websocketProperties.getInBoundChannelQueueCapacity());

    }

    @Override
    public void configureClientOutboundChannel(ChannelRegistration registration) {

        WebsocketProperties websocketProperties = properties.getWebsockets();
        registration.taskExecutor()
            .maxPoolSize(websocketProperties.getOutBoundChannelMaxPoolSize())
            .corePoolSize(websocketProperties.getOutBoundChannelCorePoolSize())
            .queueCapacity(websocketProperties.getOutBoundChannelQueueCapacity());

    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        String[] allowedOrigins = Optional.ofNullable(properties.getCors().getAllowedOrigins()).map(origins -> origins.toArray(new String[0])).orElse(new String[0]);
        // for item events (item changed, etc.)
        registry.addEndpoint("/websocket")
            .setHandshakeHandler(defaultHandshakeHandler())
            .setAllowedOrigins(allowedOrigins)
            .addInterceptors(httpSessionHandshakeInterceptor());

    }

    @Bean
    public HandshakeInterceptor httpSessionHandshakeInterceptor() {

        return new HandshakeInterceptor() {

            @Override
            public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
                if (request instanceof ServletServerHttpRequest) {
                    ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
                    attributes.put(IP_ADDRESS, servletRequest.getRemoteAddress());
                }
                return true;
            }

            @Override
            public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {

            }
        };

    }
    
    private DefaultHandshakeHandler defaultHandshakeHandler() {

        return new DefaultHandshakeHandler() {
            @Override
            protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
                Principal principal = request.getPrincipal();
                if (principal == null) {
                    Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_ANONYMOUS"));
                    principal = new AnonymousAuthenticationToken("WebsocketConfiguration", "anonymous", authorities);
                }
                return principal;
            }
        };

    }
}
