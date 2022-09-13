package at.elmo.util.spring;

import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import at.elmo.member.Member;

public class Security {

    public static void updateRolesForLoggedInUser(
            final Member member) {
        
        final var authentication = (OAuth2AuthenticationToken) SecurityContextHolder
                .getContext()
                .getAuthentication();
        
        final var user = authentication.getPrincipal();

        final var authorities = member
                .getRoles()
                .stream()
                .map(role -> "ROLE_" + role.getRole().name())
                .map(roleName -> new SimpleGrantedAuthority(roleName))
                .collect(Collectors.toList());
        
        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        new OAuth2AuthenticationToken(
                                user,
                                authorities,
                                authentication.getAuthorizedClientRegistrationId()));
        
    }
    
}
