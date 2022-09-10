package at.elmo.member.login;

import java.util.Collection;
import java.util.Map;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

public class ElmoJwtToken extends AbstractAuthenticationToken {

    private static final long serialVersionUID = 1L;

    private final ElmoOAuth2User user;

    private final String jwt;
    
    public ElmoJwtToken(
            final String jwt,
            final ElmoOAuth2Provider provider,
            final String oauth2Id,
            final String elmoId,
            final String memberApplicationId,
            final Collection<? extends GrantedAuthority> authorities) {
        
        super(authorities);
        this.user = new ElmoOAuth2User(
                provider,
                oauth2Id,
                elmoId,
                memberApplicationId,
                authorities,
                Map.of("name", elmoId != null ? elmoId : memberApplicationId));
        this.jwt = jwt;
        setAuthenticated(true);
        
    }

    public String getOAuthId() {

        return user.getOAuth2Id();

    }

    public String getJwt() {

        return jwt;

    }

    @Override
    public Object getPrincipal() {

        return user;

    }
    
    @Override
    public Object getCredentials() {
        
        return jwt;
        
    }
    
}
