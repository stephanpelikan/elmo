package at.elmo.member.login;

import at.elmo.config.ElmoProperties;
import at.elmo.config.web.JwtSecurityFilter;
import at.elmo.gui.api.v1.AppInformation;
import at.elmo.gui.api.v1.LoginApi;
import at.elmo.gui.api.v1.NativeLogin;
import at.elmo.gui.api.v1.Oauth2Client;
import at.elmo.gui.api.v1.User;
import at.elmo.member.Member;
import at.elmo.member.Role;
import at.elmo.member.onboarding.MemberOnboarding;
import at.elmo.util.UserContext;
import at.elmo.util.exceptions.ElmoException;
import at.elmo.util.refreshtoken.RefreshToken;
import at.elmo.util.refreshtoken.RefreshTokenService;
import at.elmo.util.spring.NotificationEvent;
import at.elmo.util.spring.PingNotification;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.core.ResolvableType;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken.TokenType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.validation.Valid;

@RestController("loginGuiApiController")
@RequestMapping("/api/v1")
public class GuiApiController implements LoginApi {

    public static final String FLUTTER_USER_AGENT_PREFIX = "native-";

    public static final class UpdateEmitter {
        
        private SseEmitter emitter;
        
        private Integer memberId;
        
        private List<Role> roles;
        
        private UpdateEmitter() { }
        
        public static UpdateEmitter withEmitter(final SseEmitter emitter) {
            final var result = new UpdateEmitter();
            result.emitter = emitter;
            return result;
        }
        
        public UpdateEmitter withMember(final Member member) {
            this.memberId = member.getMemberId();
            this.roles = member
                    .getRoles()
                    .stream()
                    .map(rms -> rms.getId())
                    .toList();
            return this;
        }
        
        public SseEmitter getEmitter() {
            return emitter;
        }
        
        public Integer getMemberId() {
            return memberId;
        }
        
        public List<Role> getRoles() {
            return roles;
        }
    };
    
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
    
    @Autowired
    private TaskScheduler taskScheduler;

    private Map<String, UpdateEmitter> updateEmitters = new HashMap<>();
    
    @RequestMapping(
            method = RequestMethod.GET,
            value = "/gui/updates"
        )
    public SseEmitter updatesSubscription() throws Exception {
        
        final var id = UUID.randomUUID().toString();
        
        final var member = userContext.getLoggedInMember();
        
        final var updateEmitter = new SseEmitter(-1l);
        updateEmitters.put(id, UpdateEmitter
                .withEmitter(updateEmitter)
                .withMember(member));

        // This ping forces the browser to treat the text/event-stream request
        // as closed an therefore the lock created in fetchApi.ts is released
        // to avoid the UI would stuck in cases of errors.
        taskScheduler.schedule(
                () -> {
                    try {
                        final var ping = new PingNotification();
                        updateEmitter
                                .send(
                                        SseEmitter
                                                .event()
                                                .id(UUID.randomUUID().toString())
                                                .data(ping, MediaType.APPLICATION_JSON)
                                                .name(ping.getSource().toString()));
                    } catch (Exception e) {
                        logger.warn("Could not SSE send confirmation, client might stuck");
                    }
                }, Instant.now().plusMillis(300));
        
        return updateEmitter;

    }

    @EventListener(classes = NotificationEvent.class)
    public void updateClients(
            final NotificationEvent notification) {
        
        updateEmitters
                .values()
                .stream()
                .filter(emitter -> notification.matchesTargetRoles(emitter.getRoles()))
                .forEach(emitter -> {
                    try {
                        emitter
                                .getEmitter()
                                .send(
                                        SseEmitter
                                                .event()
                                                .id(UUID.randomUUID().toString())
                                                .data(notification, MediaType.APPLICATION_JSON)
                                                .name(notification.getSource().toString())
                                                .reconnectTime(30000));
                    } catch (Exception e) {
                        logger.warn("Could not send update event", e);
                    }
                });
        
    }

    /**
     * SseEmitter timeouts are absolute. So we need to ping
     * the connection and if the user closed the browser we
     * will see an error which indicates we have to drop 
     * this emitter. 
     */
    @Scheduled(fixedDelayString = "PT1M")
    public void cleanupUpdateEmitters() {
        
        final var ping = new PingNotification();
        
        final var toBeDeleted = new LinkedList<String>();
        updateEmitters
                .entrySet()
                .forEach(entry -> {
                    try {
                        final var emitter = entry.getValue();
                        emitter
                                .getEmitter()
                                .send(
                                        SseEmitter
                                                .event()
                                                .id(UUID.randomUUID().toString())
                                                .data(ping, MediaType.APPLICATION_JSON)
                                                .name(ping.getSource().toString()));
                    } catch (Exception e) {
                        toBeDeleted.add(entry.getKey());
                    }
                });
        toBeDeleted.forEach(updateEmitters::remove);
        
    }

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
        result.setContactEmailAddress(properties.getGeneralEmailAddress());

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
