package at.elmo.user;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

@Component
public class OAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(
            final OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        
        final var user = super.loadUser(userRequest);
        
        final var provider = ElmoOAuth2Provider
                .byRegistrationId(userRequest.getClientRegistration().getRegistrationId());
        
        return new ElmoOAuth2User(provider, user.getAuthorities(), user.getAttributes());
        
    }
    
}
