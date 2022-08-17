package at.elmo.member.login;

import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

public class ElmoOAuth2User extends DefaultOAuth2User {

    private static final long serialVersionUID = 1L;

    private final ElmoOAuth2Provider provider;
    
    private final String oauth2Id;

    private final String elmoId;

    private final String memberApplicationId;

    public ElmoOAuth2User(
            final ElmoOAuth2Provider provider,
            final String oauth2Id,
            final String elmoId,
            final String memberApplicationId,
            final Collection<? extends GrantedAuthority> authorities,
            final Map<String, Object> attributes) {
        
        super(authorities, attributes, "name");
        this.provider = provider;
        this.oauth2Id = oauth2Id;
        this.elmoId = elmoId;
        this.memberApplicationId = memberApplicationId;
        
    };
    
    public ElmoOAuth2Provider getProvider() {

        return provider;

    }

    public String getOAuth2Id() {

        return oauth2Id;

    }
    
    public String getElmoId() {

        return elmoId;

    }

    public String getMemberApplicationId() {

        return memberApplicationId;

    }

    public boolean isNewUser() {

        return (elmoId == null) && (memberApplicationId == null);

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
