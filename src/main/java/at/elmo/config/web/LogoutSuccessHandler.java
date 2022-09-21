package at.elmo.config.web;

import at.elmo.config.ElmoProperties;
import at.elmo.member.login.ElmoOAuth2User;
import at.elmo.util.refreshtoken.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class LogoutSuccessHandler implements org.springframework.security.web.authentication.logout.LogoutSuccessHandler {

    @Autowired
    private ElmoProperties properties;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Override
    public void onLogoutSuccess(
            final HttpServletRequest request,
            final HttpServletResponse response,
            final Authentication authentication)
            throws IOException, ServletException {

        if ((authentication != null)
                && (authentication.getPrincipal() != null)) {
    
            final var user = (ElmoOAuth2User) authentication.getPrincipal();
    
            // delete refresh token
            refreshTokenService.deleteRefreshToken(
                    user.getOAuth2Id(),
                    user.getProvider());
    
            // delete access token
            final var authCookie = new Cookie(JwtSecurityFilter.COOKIE_AUTH, "");
            authCookie.setHttpOnly(true);
            authCookie.setPath("/");
            authCookie.setMaxAge(0);
            response.addCookie(authCookie);
            
        }

        response.sendRedirect(properties.getGatewayUrl());

    }

}
