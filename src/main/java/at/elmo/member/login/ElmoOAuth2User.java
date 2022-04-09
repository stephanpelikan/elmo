package at.elmo.member.login;

import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

public class ElmoOAuth2User extends DefaultOAuth2User {

    private static final long serialVersionUID = 1L;

    private final ElmoOAuth2Provider provider;
    
    public ElmoOAuth2User(
            final ElmoOAuth2Provider provider,
            final Collection<? extends GrantedAuthority> authorities,
            final Map<String, Object> attributes) {
        
        super(authorities, attributes, "name");
        this.provider = provider;
        
    };
    
    public ElmoOAuth2Provider getProvider() {

        return provider;

    }

    public String getOAuth2Id() {

        switch (provider) {
        case AMAZON:
            return getAttribute("user_id");
        default:
            return getAttribute("sub");
        }

    }
    
    public String getEmail() {
        
        return getAttribute("email");
        
    }
    
    public boolean isEmailVerified() {
        
        final Boolean verified = getAttribute("email_verified");
        if (verified == null) {
            return false;
        }
        return verified.booleanValue();
        
    }
    
    public String getFirstName() {

        return getAttribute("given_name");

    }

    // picture=https://lh3.googleusercontent.com/a/AATXAJxL1ZUhshyuMwANp3bb3muwAxxFtqbsbOJ9DH1v=s96-c

}
