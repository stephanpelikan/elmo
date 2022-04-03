package at.elmo.user;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import at.elmo.config.ElmoProperties;

@Component
public class AuthenticationSuccessHandler
        extends SavedRequestAwareAuthenticationSuccessHandler {

    private final UserService userService;
    
    public AuthenticationSuccessHandler(
            final ElmoProperties properties,
            final UserService userService) {
        
        super();
        this.userService = userService;
        
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
        
        final var oAuth2User = (OAuth2User) authentication.getPrincipal();

        userService.loadOrRegisterUser(oAuth2User);
        
        super.onAuthenticationSuccess(request, response, authentication);

    }

}
