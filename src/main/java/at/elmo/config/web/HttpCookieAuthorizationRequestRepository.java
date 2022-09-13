package at.elmo.config.web;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Base64;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

public class HttpCookieAuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final String COOKIE_NAME = "oa2r";

    @Autowired
    private Logger logger;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(
            final HttpServletRequest request) {

        final var cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        String base64Encoded = null;
        for (final Cookie cookie : cookies) {
            if (cookie.getName().equals(COOKIE_NAME)) {
                base64Encoded = cookie.getValue();
            }
        }
        if (base64Encoded == null) {
            return null;
        }

        final var serialized = Base64.getDecoder().decode(base64Encoded);

        try (final var in = new ObjectInputStream(new ByteArrayInputStream(serialized))) {

            return (OAuth2AuthorizationRequest) in.readObject();

        } catch (Exception e) {

            logger.warn("Could not read oauth2 request", e);
            return null;

        }

    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(
            final HttpServletRequest request,
            final HttpServletResponse response) {
        
        final var result = loadAuthorizationRequest(request);
        
        final var cookie = new Cookie(COOKIE_NAME, "");
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        
        return result;
        
    }

    @Override
    public void saveAuthorizationRequest(
            final OAuth2AuthorizationRequest authorizationRequest,
            final HttpServletRequest request,
            final HttpServletResponse response) {
        
        try {
            
            final var serializer = new ByteArrayOutputStream();
            new ObjectOutputStream(serializer).writeObject(authorizationRequest);
            serializer.close();
            
            final var serialized = serializer.toByteArray();
            
            final var cookie = new Cookie(
                    COOKIE_NAME,
                    Base64.getEncoder().encodeToString(serialized));
            cookie.setPath("/");
            cookie.setHttpOnly(true);
            response.addCookie(cookie);

        } catch (Exception e) {
            
            logger.error("Could not write oauth2 request", e);

        }

    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request) {

        throw new UnsupportedOperationException();

    }

}
