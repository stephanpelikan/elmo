package at.elmo.member.login;

import java.util.LinkedList;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;

import at.elmo.member.MemberService;
import at.elmo.member.onboarding.MemberOnboarding;

public class OAuth2UserService extends DefaultOAuth2UserService {

    private final MemberService memberService;
    
    private final MemberOnboarding memberOnboarding;
    
    public OAuth2UserService(
            final MemberOnboarding memberOnboarding,
            final MemberService memberService) {
        
        super();
        this.memberService = memberService;
        this.memberOnboarding = memberOnboarding;
        
    }

    @Override
    public OAuth2User loadUser(
            final OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        
        final var user = super.loadUser(userRequest);
        
        final var provider = ElmoOAuth2Provider
                .byRegistrationId(userRequest.getClientRegistration().getRegistrationId());
        
        final String oauth2Id;
        switch (provider) {
        case AMAZON: oauth2Id = user.getAttribute("user_id"); break;
        default: oauth2Id = user.getAttribute("sub");
        };

        // login of registered member
        final var member = memberService.getMemberByOAuth2User(oauth2Id);
        if (!member.isEmpty()) {
            
            final var elmoId = member.get().getId();
            
            final var authorities = new LinkedList<GrantedAuthority>(user.getAuthorities());
            member
                    .get()
                    .getRoles()
                    .stream()
                    .map(role -> "ROLE_" + role.getRole().name())
                    .map(roleName -> new SimpleGrantedAuthority(roleName))
                    .forEach(authorities::add);

            return new ElmoOAuth2User(provider, oauth2Id, elmoId, null, authorities, user.getAttributes());

        }
        
        // login of person for which registration is in progress
        final var memberApplication = memberOnboarding.getMemberApplicationByOAuth2User(oauth2Id);
        if (!memberApplication.isEmpty()) {

            final var memberApplicationId = memberApplication.get().getId();

            return new ElmoOAuth2User(provider, oauth2Id, null, memberApplicationId, user.getAuthorities(),
                    user.getAttributes());

        }
        
        // login of new person
        return new ElmoOAuth2User(provider, oauth2Id, null, null, user.getAuthorities(), user.getAttributes());

    }
    
}
