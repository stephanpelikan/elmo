package at.elmo.config.web;

import at.elmo.car.Car;
import at.elmo.car.CarRepository;
import at.elmo.config.ElmoProperties;
import at.elmo.member.Member;
import at.elmo.member.MemberRepository;
import at.elmo.member.Role;
import at.elmo.member.login.ElmoJwtToken;
import at.elmo.member.login.ElmoOAuth2Provider;
import at.elmo.member.login.ElmoOAuth2User;
import at.elmo.member.onboarding.MemberApplication;
import at.elmo.member.onboarding.MemberApplicationRepository;
import at.elmo.util.config.ConfigService;
import at.elmo.util.refreshtoken.RefreshToken;
import at.elmo.util.refreshtoken.RefreshTokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;
import javax.crypto.SecretKey;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class JwtSecurityFilter extends OncePerRequestFilter {

    public static final String USER_AGENT_HEADER = "User-Agent";

    public static final String APP_USER_AGENT = "Elmo-App";

    public static final String AUTH_HEADER = "Authorization";

    public static final String AUTH_PREFIX = "Bearer ";

    public static final String COOKIE_AUTH = "token";

    private static final String JWT_PROVIDER = "p";

    private static final String JWT_ROLE = "role";

    private static final String JWT_ELMO_ID = "e";

    private static final String JWT_MEMBER_APPLICATION_ID = "a";

    private static final String JWT_CAR_ROLE = "ROLE_" + Role.CAR.name();

    @Autowired
    private ElmoProperties properties;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private MemberRepository members;

    @Autowired
    private MemberApplicationRepository memberApplications;

    @Autowired
    private CarRepository cars;

    @Autowired
    private ConfigService configs;

    private static SecretKey key;

    private static Duration accessTokenLifetime;

    private static final ThreadLocal<HttpServletResponse> currentResponse = new ThreadLocal<HttpServletResponse>();

    @PostConstruct
    protected void initalize() {

        accessTokenLifetime = properties.getAccessTokenLifetime();

        final var existingSecret = configs.getJwtSecret();
        if (existingSecret.isPresent()) {

            key = Keys.hmacShaKeyFor(
                    Decoders.BASE64.decode(
                            existingSecret.get()));

        } else {

            key = Keys.secretKeyFor(SignatureAlgorithm.HS512);
            configs.setJwtSecret(
                    Encoders.BASE64.encode(key.getEncoded()));

        }

    }

    @Override
    protected void doFilterInternal(
            final HttpServletRequest request,
            final HttpServletResponse response,
            final FilterChain filterChain)
            throws ServletException, IOException {

        try {

            currentResponse.set(response);

            final var jwt = resolveToken(request);
            if (jwt != null) {

                final var jwtBody = Jwts
                                .parserBuilder()
                                .setSigningKey(key)
                                .build()
                                .parseClaimsJws(jwt)
                                .getBody();
                final var id = jwtBody.getSubject();
                @SuppressWarnings("unchecked")
                final var roles = ((List<String>) jwtBody.get(JWT_ROLE, List.class));

                final ElmoJwtToken auth;
                if (roles.contains(JWT_CAR_ROLE)) {
                    final var carId = jwtBody.get(JWT_ELMO_ID, String.class);
                    final var car = cars.findById(carId);
                    if (car.isEmpty()) {
                        throw new Exception("Unknown car id '" + carId + "'");
                    }
                    if (!car.get().isAppActive()) {
                        response.sendError(HttpStatus.UNAUTHORIZED.value());
                        return;
                    }
                    auth = buildAuthentication(jwt, jwtBody, roles, car.get());
                } else {
                    final var member = members.findByOauth2Ids_Id(id);
                    if (member.isEmpty()) {
                        final var memberApplication = memberApplications.findByOauth2Id_Id(id);
                        if (memberApplication.isEmpty()) {
                            response.sendError(HttpStatus.FORBIDDEN.value());
                            return;
                        } else {
                            auth = buildAuthentication(jwt, jwtBody, roles, null, memberApplication.get().getId());
                        }
                    } else {
                        auth = buildAuthentication(jwt, jwtBody, roles, member.get().getId(), null);
                    }
                }

                SecurityContextHolder.getContext().setAuthentication(auth);

            } else if (request.getHeader(RefreshToken.HEADER_NAME) != null) {

                throw new ExpiredJwtException(null, null, null);

            }

            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException e) {

            final var refreshToken = request.getHeader(RefreshToken.HEADER_NAME);
            if (!StringUtils.hasText(refreshToken)) {
                response.sendError(HttpStatus.UNAUTHORIZED.value());
                return;
            }

            final var newRefreshToken = refreshTokenService
                    .consumeRefreshToken(
                            refreshToken);
            if (newRefreshToken == null) {
                response.sendError(HttpStatus.UNAUTHORIZED.value());
                return;
            }

            response.setHeader(RefreshToken.HEADER_NAME, newRefreshToken.getToken());

            final ElmoJwtToken auth;
            final var id = newRefreshToken.getOauth2Id();
            final var car = cars.findById(id);
            if (car.isPresent()) {
                if (!car.get().isAppActive()) {
                    response.sendError(HttpStatus.UNAUTHORIZED.value());
                    return;
                }
                auth = buildAuthentication(newRefreshToken, car.get());
            } else {
                final var member = members.findByOauth2Ids_Id(id);
                if (member.isEmpty()) {
                    final var memberApplication = memberApplications.findByOauth2Id_Id(id);
                    if (memberApplication.isEmpty()) {
                        response.sendError(HttpStatus.FORBIDDEN.value());
                        return;
                    } else {
                        auth = buildAuthentication(newRefreshToken, null, memberApplication.get());
                    }
                } else {
                    auth = buildAuthentication(newRefreshToken, member.get(), null);
                }
            }

            setToken(request, response, auth.getJwt());

            SecurityContextHolder.getContext().setAuthentication(auth);

            filterChain.doFilter(request, response);

        } catch (Exception e) {

            logger.warn("JWT-error", e);
            response.sendError(HttpStatus.UNAUTHORIZED.value());

        } finally {

            SecurityContextHolder.getContext().setAuthentication(null);
            SecurityContextHolder.clearContext();

            currentResponse.remove();

        }

    }

    public static String getCarIdFromToken(
            final String jwt) throws Exception {

        final var jwtBody = Jwts
                .parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(jwt)
                .getBody();

        @SuppressWarnings("unchecked")
        final var roles = ((List<String>) jwtBody.get(JWT_ROLE, List.class));
        if (!roles.contains(JWT_CAR_ROLE)) {
            return null;
        }

        final var carId = jwtBody.get(JWT_ELMO_ID, String.class);
        return carId;

    }

    private ElmoJwtToken buildAuthentication(
            final RefreshToken refreshToken,
            final Member member,
            final MemberApplication memberApplication) {

        return buildAuthentication(
                refreshToken.getProvider(),
                refreshToken.getOauth2Id(),
                member,
                memberApplication);

    }

    private static ElmoJwtToken buildAuthentication(
            final RefreshToken refreshToken,
            final Car car) {

        final var provider = refreshToken.getProvider();
        final var carShortcut = refreshToken.getOauth2Id();

        final var roles = List.of(JWT_CAR_ROLE);

        final var jwt = generateToken(
                provider,
                carShortcut,
                car.getId(),
                null,
                roles);

        final var authorities = roles
                .stream()
                .map(role -> new SimpleGrantedAuthority(role))
                .collect(Collectors.toList());

        return new ElmoJwtToken(
                jwt,
                new Date(),
                provider,
                carShortcut,
                car.getId(),
                null,
                authorities);

    }

    public static ElmoJwtToken buildAuthentication(
            final ElmoOAuth2User user) {

        final var jwt = generateToken(user);

        return new ElmoJwtToken(
                jwt,
                user,
                new Date());

    }

    public static ElmoJwtToken buildAuthentication(
            final ElmoOAuth2Provider provider,
            final String oauth2Id,
            final Member member,
            final MemberApplication memberApplication) {

        final List<String> roles = member == null
                ? List.of()
                : member
                        .getRoles()
                        .stream()
                        .map(role -> "ROLE_" + role.getRole().name())
                        .collect(Collectors.toList());

        final var jwt = generateToken(
                provider,
                oauth2Id,
                member != null ? member.getId() : null,
                memberApplication != null ? memberApplication.getId() : null,
                roles);

        final var authorities = roles
                .stream()
                .map(role -> new SimpleGrantedAuthority(role))
                .collect(Collectors.toList());

        return new ElmoJwtToken(
                jwt,
                new Date(),
                provider,
                oauth2Id,
                member != null ? member.getId() : null,
                memberApplication != null ? memberApplication.getId() : null,
                authorities);

    }

    private ElmoJwtToken buildAuthentication(
            final String jwt,
            final Claims jwtBody,
            final List<String> jwtRoles,
            final Car car) {

        final var provider = ElmoOAuth2Provider.byRegistrationId(jwtBody.get(JWT_PROVIDER, String.class));
        final var carShortcut = jwtBody.getSubject();

        final var roles = jwtRoles
                .stream()
                .map(role -> new SimpleGrantedAuthority(role))
                .collect(Collectors.toList());

        return new ElmoJwtToken(
                jwt,
                jwtBody.getIssuedAt(),
                provider,
                carShortcut,
                car.getId(),
                null,
                roles);

    }

    private ElmoJwtToken buildAuthentication(
            final String jwt,
            final Claims jwtBody,
            final List<String> jwtRoles,
            final String elmoId,
            final String memberApplicationId) {

        final var provider = ElmoOAuth2Provider.byRegistrationId(jwtBody.get(JWT_PROVIDER, String.class));
        final var oauth2Id = jwtBody.getSubject();

        final var roles = jwtRoles
                .stream()
                .map(role -> new SimpleGrantedAuthority(role))
                .collect(Collectors.toList());

        return new ElmoJwtToken(
                jwt,
                jwtBody.getIssuedAt(),
                provider,
                oauth2Id,
                elmoId,
                memberApplicationId,
                roles);

    }

    private String resolveToken(
            final HttpServletRequest request) {

        // Custom calls from Elmo-Drivers-App
        final var userAgent = request.getHeader(USER_AGENT_HEADER);
        if ((userAgent != null)
                && userAgent.equals(APP_USER_AGENT)) {

            final var authorization = request.getHeader(AUTH_HEADER);
            if ((authorization != null)
                && authorization.startsWith(AUTH_PREFIX)) {
                return authorization.substring(AUTH_PREFIX.length());
            } else {
                return null;
            }

        }

        // Common user requests
        final var cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (final Cookie cookie : cookies) {
            if (cookie.getName().equals(COOKIE_AUTH)) {
                return cookie.getValue();
            }
        }

        return null;

    }

    public static void setToken(
            final ElmoOAuth2User user) {

        setToken(currentResponse.get(), user);

    }

    public static void setToken(
            final HttpServletResponse response,
            final ElmoOAuth2User user) {

        final String token = JwtSecurityFilter.generateToken(user);
        setToken(null, response, token);

    }

    private static void setToken(
            final HttpServletRequest request,
            final HttpServletResponse response,
            final String token) {

        // Custom calls from Elmo-Drivers-App
        if (request != null) {
            final var userAgent = request.getHeader(USER_AGENT_HEADER);
            if ((userAgent != null)
                    && userAgent.equals(APP_USER_AGENT)) {

                response.setHeader(AUTH_HEADER, token);

            }
        }

        // Common user requests
        final var authCookie = new Cookie(COOKIE_AUTH, token);
        authCookie.setHttpOnly(true);
        authCookie.setPath("/");
        authCookie.setMaxAge((int) accessTokenLifetime.getSeconds() * 2);
        response.addCookie(authCookie);

    }

    public static String generateToken(
            final ElmoOAuth2Provider provider,
            final String oauth2Id,
            final String elmoId,
            final String memberApplicationId,
            final List<String> roles) {

        return generateToken(
                provider,
                oauth2Id,
                elmoId,
                memberApplicationId,
                roles,
                accessTokenLifetime.getSeconds());

    }

    public static String generateToken(
            final ElmoOAuth2Provider provider,
            final String oauth2Id,
            final String elmoId,
            final String memberApplicationId,
            final List<String> roles,
            final long expirationInSeconds) {

        final var claims = new HashMap<String, Object>();
        claims.put(JWT_ROLE, roles);
        claims.put(JWT_PROVIDER, provider.getRegistrationId());
        if (elmoId != null) {
            claims.put(JWT_ELMO_ID, elmoId);
        }
        if (memberApplicationId != null) {
            claims.put(JWT_MEMBER_APPLICATION_ID, memberApplicationId);
        }

        return Jwts.builder()
                .setSubject(oauth2Id)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + expirationInSeconds * 1000))
                .addClaims(claims)
                .signWith(key)
                .compact();

    }

    public static String generateToken(
            final ElmoOAuth2User user,
            final long expirationInSeconds) {

        return generateToken(
                user.getProvider(),
                user.getOAuth2Id(),
                user.getElmoId(),
                user.getMemberApplicationId(),
                user.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList()),
                expirationInSeconds);

    }

    public static String generateToken(
            final ElmoOAuth2User user) {

        return generateToken(
                user.getProvider(),
                user.getOAuth2Id(),
                user.getElmoId(),
                user.getMemberApplicationId(),
                user.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList()),
                accessTokenLifetime.getSeconds());

    }

}
