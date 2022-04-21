package at.elmo.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import at.elmo.member.Member;
import at.elmo.member.Member.Role;
import at.elmo.member.MemberRepository;
import at.elmo.member.login.ElmoOAuth2User;

@Component
public class UserContext {

    @Autowired
    private MemberRepository members;

    public Member getLoggedInMember() {

        final var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new ElmoException("No security context");
        }
        if (!authentication.isAuthenticated()) {
            throw new ElmoException("User anonymous");
        }
        if (!(authentication.getPrincipal() instanceof ElmoOAuth2User)) {
            throw new ElmoException("User logged in not of incstance '" + ElmoOAuth2User.class + "'");
        }

        final var oauth2User = (ElmoOAuth2User) authentication.getPrincipal();

        final var result = members.findByOauth2Ids_Id(oauth2User.getOAuth2Id());
        if (result.isEmpty()) {
            throw new ElmoException("There is no member-record for user logged '" + oauth2User.getOAuth2Id() + "'");
        }
        
        return result.get();

    }
    
    public boolean hasRole(
            final Member.Role minimalConstraint) {
        
        final var member = getLoggedInMember();
        
        for (final var role : Role.orderedByConstraint(minimalConstraint)) {
            if (member.hasRole(role)) {
                return true;
            }
        }

        return false;
        
    }
    
}
