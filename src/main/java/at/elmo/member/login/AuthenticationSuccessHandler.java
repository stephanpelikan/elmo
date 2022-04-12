package at.elmo.member.login;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;

import at.elmo.config.ElmoProperties;
import at.elmo.member.MemberService;

public class AuthenticationSuccessHandler
        extends SavedRequestAwareAuthenticationSuccessHandler {

    private final MemberService memberService;
    
    public AuthenticationSuccessHandler(
            final ElmoProperties properties,
            final MemberService memberService) {
        
        super();
        this.memberService = memberService;
        
        final var redirectStrategy = new RedirectStrategy() {
            @Override
            public void sendRedirect(
                    final HttpServletRequest request,
                    final HttpServletResponse response,
                    final String url) throws IOException {
                
                final var targetUrl = response.encodeRedirectURL(url);
                response.sendRedirect(properties.getGatewayUrl() + targetUrl);
                
            }
        };
        setRedirectStrategy(redirectStrategy);

    }
    
    @Override
    public void onAuthenticationSuccess(
            final HttpServletRequest request,
            final HttpServletResponse response,
            final Authentication authentication) throws IOException, ServletException {
        
        final var oauth2User = (ElmoOAuth2User) authentication.getPrincipal();

        if (oauth2User.isNewUser()) {

            try {
                memberService.registerMemberByOAuth2User(oauth2User);
            } catch (Exception e) {
                throw new ServletException("Could not register oauth2 user", e);
            }

        }
        
        super.onAuthenticationSuccess(request, response, authentication);

    }
    
}
