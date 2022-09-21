package at.elmo.gui.api;

import at.elmo.config.ElmoProperties;
import at.elmo.config.web.JwtSecurityFilter;
import at.elmo.gui.api.v1.AppInformation;
import at.elmo.gui.api.v1.GuiApi;
import at.elmo.gui.api.v1.NativeLogin;
import at.elmo.gui.api.v1.Oauth2Client;
import at.elmo.gui.api.v1.User;
import at.elmo.member.login.ElmoJwtToken;
import at.elmo.member.login.ElmoOAuth2User;
import at.elmo.member.login.OAuth2UserService;
import at.elmo.member.onboarding.MemberOnboarding;
import at.elmo.util.UserContext;
import at.elmo.util.exceptions.ElmoException;
import at.elmo.util.refreshtoken.RefreshToken;
import at.elmo.util.refreshtoken.RefreshTokenService;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ResolvableType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken.TokenType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedList;
import java.util.List;

import javax.validation.Valid;

@RestController("guiApiControllers")
@RequestMapping("/api/v1")
public class GuiApiController implements GuiApi {

    private static final String FLUTTER_USER_AGENT_PREFIX = "native-";

    @Autowired
    private Logger logger;

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    @Autowired
    private UserContext userContext;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private ElmoProperties properties;

    @Autowired
    private MemberOnboarding memberOnboarding;

    @Autowired
    private GuiMapper mapper;

    @Autowired
    private OAuth2UserService oauth2UserService;

    @Override
    public ResponseEntity<User> currentUser(
            final String xRefreshToken) {

        try {

            final var member = userContext.getLoggedInMember();
            if (member != null) {
                return buildCurrentUserResponse(xRefreshToken, mapper.toApi(member));
            }

            final var application = userContext.getLoggedInMemberApplication();
            return buildCurrentUserResponse(xRefreshToken, mapper.toApi(application));


        } catch (ElmoException e) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        }

    }

    private ResponseEntity<User> buildCurrentUserResponse(
            final String xRefreshToken,
            final User user) {

        final var response = ResponseEntity
                .ok();

        final var authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();
        if ((authentication instanceof ElmoJwtToken)
                // if current-user was requested including a refresh token
                // then the new token was already set by JwtSecurityFilter
                && (xRefreshToken == null)) {

            final var token = (ElmoJwtToken) authentication;
            final var issuedBefore = System.currentTimeMillis() - token.getIssuedAt().getTime();
            if (issuedBefore < 10000) { // token issues within 10 seconds

                final var refreshToken = refreshTokenService
                        .buildRefreshToken(
                                token.getOAuthId(),
                                ((ElmoOAuth2User) token.getPrincipal()).getProvider());
                response.header(RefreshToken.HEADER_NAME, refreshToken);

            }

        }

        return response.body(user);

    }

    @Override
    public ResponseEntity<AppInformation> appInformation() {

        final var result = new AppInformation();
        result.setVersion(properties.getVersion());
        result.setHomepageUrl(properties.getHomepageUrl());
        result.setHomepageServiceConditionsUrl(properties.getHomepageServiceConditionsUrl());
        result.setTitleShort(properties.getTitleShort());
        result.setTitleLong(properties.getTitleLong());

        return ResponseEntity.ok(result);

    }

    @Override
    public ResponseEntity<List<Oauth2Client>> oauth2Clients(
            final String userAgent) {

        // Flutter wrapper app
        if ((userAgent != null)
                && userAgent.startsWith(FLUTTER_USER_AGENT_PREFIX)) {

            return flutterAppOAuth2Clients(userAgent);

        }

        return webAppOAuth2Clients();

    }

    private ResponseEntity<List<Oauth2Client>> flutterAppOAuth2Clients(
            final String userAgent) {

        final var registrationId = userAgent.substring(FLUTTER_USER_AGENT_PREFIX.length());
        final var client = clientRegistrationRepository.findByRegistrationId(registrationId);
        if (registrationId == null) {
            return ResponseEntity.notFound().build();
        }

        final var flutterNative = new Oauth2Client();
        flutterNative.setId(registrationId);
        flutterNative.setUrl("native");
        flutterNative.setName(client.getClientName());

        return ResponseEntity.ok(List.of(flutterNative));

    }

    @Override
    public ResponseEntity<Void> nativeAppLogin(
            final @Valid NativeLogin nativeLogin) {

        if ((nativeLogin == null)
                || !StringUtils.hasText(nativeLogin.getClientId())
                || !StringUtils.hasText(nativeLogin.getOauth2Id())
                || !StringUtils.hasText(nativeLogin.getAccessToken())) {
            return ResponseEntity.badRequest().build();
        }

        final var client = clientRegistrationRepository.findByRegistrationId(nativeLogin.getClientId());

        final ElmoOAuth2User oauth2User;
        try {
            oauth2User = (ElmoOAuth2User) oauth2UserService.loadUser(
                new OAuth2UserRequest(
                        client,
                        new OAuth2AccessToken(TokenType.BEARER, nativeLogin.getAccessToken(), Instant.MIN, Instant.MAX)));
        } catch (Exception e) {
            logger.error("oauth", e);
            return ResponseEntity.badRequest().build();
        }
//        final var userInfoUri = UriComponentsBuilder.fromUriString(
//                client.getProviderDetails().getUserInfoEndpoint().getUri()).build().toUri();
//        final var userInfoRequestHeaders = new HttpHeaders();
//        userInfoRequestHeaders.setBearerAuth(nativeLogin.getAccessToken());
//        final var userInfoRequest = new HttpEntity<>(userInfoRequestHeaders);
//        final var restTemplate = new RestTemplate();
//        final var userInfoResponse = restTemplate.exchange(userInfoUri, HttpMethod.GET, userInfoRequest, Map.class);
//
//        final var oauth2Id = userInfoResponse.getBody().get(
//                client.getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName());
//        if ((oauth2Id == null)
//                || !nativeLogin.getOauth2Id().equals(oauth2Id)) {
//            logger.warn("Native login: For given oauth2Id '{}' the user2Id in user-info response does not match: '{}'!",
//                    nativeLogin.getOauth2Id(),
//                    oauth2Id);
//            return ResponseEntity.badRequest().build();
//        }

        final var authentication = JwtSecurityFilter.buildAuthentication(oauth2User);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        if (oauth2User.isNewUser()) {

            try {
                memberOnboarding.doOnboarding(oauth2User);
            } catch (Exception e) {
                throw new RuntimeException("Could not register oauth2 user", e);
            }

        }

        // user might be updated due to onboarding...
        final var user = (ElmoOAuth2User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        JwtSecurityFilter.setToken(user);

//        final ElmoJwtToken authentication;
//        final var member = memberService.getMemberByOAuth2User(nativeLogin.getOauth2Id());
//        if (member.isEmpty()) {
//            final var memberApplication = memberOnboarding.getMemberApplicationByOAuth2User(nativeLogin.getOauth2Id());
//            if (memberApplication.isEmpty()) {
//                if (!user.isNewUser()) {
//                    return ResponseEntity.notFound().build();
//                }
//
//            }
//            authentication = JwtSecurityFilter.buildAuthentication(
//                    ElmoOAuth2Provider.byRegistrationId(nativeLogin.getClientId()),
//                    nativeLogin.getOauth2Id(),
//                    null,
//                    memberApplication.get());
//        } else {
//            authentication = JwtSecurityFilter.buildAuthentication(
//                    ElmoOAuth2Provider.byRegistrationId(nativeLogin.getClientId()),
//                    nativeLogin.getOauth2Id(),
//                    member.get(),
//                    null);
//        }
//
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//        JwtSecurityFilter.setToken((ElmoOAuth2User) authentication.getPrincipal());

        return ResponseEntity.ok().build();

    }

    private ResponseEntity<List<Oauth2Client>> webAppOAuth2Clients() {

        final var type = ResolvableType.forInstance(clientRegistrationRepository).as(Iterable.class);
        if (type == ResolvableType.NONE || !ClientRegistration.class.isAssignableFrom(type.resolveGenerics()[0])) {
            return ResponseEntity.ok(List.of());
        }
        @SuppressWarnings("unchecked")
        final var clientRegistrations = (Iterable<ClientRegistration>) clientRegistrationRepository;

        final var result = new LinkedList<Oauth2Client>();

        clientRegistrations
                .forEach(registration -> {
                    final var client = new Oauth2Client();
                    client.setId(
                            registration.getRegistrationId());
                    client.setUrl(
                            OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI
                            + "/"
                            + registration.getRegistrationId());
                    client.setName(
                            registration.getClientName());
                    result.add(client);
                });

        return ResponseEntity.ok(result);

    }

}
