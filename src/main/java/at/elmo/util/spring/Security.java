package at.elmo.util.spring;

import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import at.elmo.member.Member;
import at.elmo.member.login.ElmoJwtToken;
import at.elmo.member.login.ElmoOAuth2User;

public class Security {

    public static void updateRolesForLoggedInUser(
            final Member member) {
        
        final var authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();
        
        final var authorities = member
                .getRoles()
                .stream()
                .map(role -> "ROLE_" + role.getRole().name())
                .map(roleName -> new SimpleGrantedAuthority(roleName))
                .collect(Collectors.toList());

        final var user = (ElmoOAuth2User) authentication.getPrincipal();

        if (authentication instanceof ElmoJwtToken) {
            
            final var token = (ElmoJwtToken) authentication;
            
            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            new ElmoJwtToken(
                                    token.getJwt(),
                                    token.getIssuedAt(),
                                    user.getProvider(),
                                    user.getOAuth2Id(),
                                    user.getElmoId(),
                                    user.getMemberApplicationId(),
                                    authorities));
            
        } else if (authentication instanceof OAuth2AuthenticationToken) {
            
            final var token = (OAuth2AuthenticationToken) authentication;
            
            final var newUser = new ElmoOAuth2User(
                    user.getProvider(),
                    user.getOAuth2Id(),
                    user.getElmoId(),
                    user.getMemberApplicationId(),
                    authorities,
                    user.getAttributes());
            
            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            new OAuth2AuthenticationToken(
                                    newUser,
                                    authorities,
                                    token.getAuthorizedClientRegistrationId()));
            
        } else {
            
            throw new UnsupportedOperationException(authentication.getClass().getName());
            
        }
        
    }
    
}
