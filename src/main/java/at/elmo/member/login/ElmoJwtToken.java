package at.elmo.member.login;

import java.util.Collection;
import java.util.Date;
import java.util.Map;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

public class ElmoJwtToken extends AbstractAuthenticationToken {

    private static final long serialVersionUID = 1L;

    private final ElmoOAuth2User user;

    private final String jwt;
    
    private final Date issuedAt;

    public ElmoJwtToken(
            final String jwt,
            final Date issuedAt,
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
        this.issuedAt = issuedAt;
        setAuthenticated(true);
        
    }
    
    public ElmoJwtToken(
            final String jwt,
            final ElmoOAuth2User user,
            final Date issuedAt) {
        
        super(user.getAuthorities());
        this.jwt = jwt;
        this.user = user;
        this.issuedAt = issuedAt;
        
    }

    public String getOAuthId() {

        return user.getOAuth2Id();

    }
    
    public String getElmoId() {
        
        return user.getElmoId();
        
    }

    public String getJwt() {

        return jwt;

    }

    public Date getIssuedAt() {

        return issuedAt;

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
