package at.elmo.user;

import java.util.Arrays;

public enum ElmoOAuth2Provider {

    GOOGLE("google"), // see https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow
    AMAZON("amazon"); // see https://developer.amazon.com/de/docs/login-with-amazon/web-docs.html

    private String registrationId;
    
    private ElmoOAuth2Provider(
            final String registrationId) {
        
        this.registrationId = registrationId;
        
    }
    
    public static ElmoOAuth2Provider byRegistrationId(
            final String registrationId) {
        
        final var result = Arrays
                .stream(ElmoOAuth2Provider.values())
                .filter(provider -> provider.registrationId.equals(registrationId))
                .findFirst();
        
        if (result.isPresent()) {
            return result.get();
        }
        
        return null;
        
    }
            
}
