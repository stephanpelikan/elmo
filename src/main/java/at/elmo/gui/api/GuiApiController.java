package at.elmo.gui.api;

import java.time.Duration;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.core.ResolvableType;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.util.UriComponentsBuilder;

import at.elmo.config.ElmoProperties;
import at.elmo.config.web.JwtSecurityFilter;
import at.elmo.gui.api.v1.AppInformation;
import at.elmo.gui.api.v1.GuiApi;
import at.elmo.gui.api.v1.MemberApplicationForm;
import at.elmo.gui.api.v1.NativeLogin;
import at.elmo.gui.api.v1.Oauth2Client;
import at.elmo.gui.api.v1.TakeoverMemberApplicationFormRequest;
import at.elmo.gui.api.v1.TextMessageRequest;
import at.elmo.gui.api.v1.TextMessages;
import at.elmo.gui.api.v1.User;
import at.elmo.member.MemberService;
import at.elmo.member.MemberService.MemberApplicationUpdate;
import at.elmo.member.login.ElmoJwtToken;
import at.elmo.member.login.ElmoOAuth2Provider;
import at.elmo.member.login.ElmoOAuth2User;
import at.elmo.member.onboarding.MemberOnboarding;
import at.elmo.util.UserContext;
import at.elmo.util.email.EmailService;
import at.elmo.util.exceptions.ElmoException;
import at.elmo.util.exceptions.ElmoValidationException;
import at.elmo.util.refreshtoken.RefreshToken;
import at.elmo.util.refreshtoken.RefreshTokenService;
import at.elmo.util.sms.SmsEvent;
import at.elmo.util.sms.SmsService;

@RestController
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
    private MemberService memberService;
    
    @Autowired
    private MemberOnboarding memberOnboarding;

    @Autowired
    private GuiMapper mapper;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private SmsService smsService;
    
    private Map<String, SseEmitter> smsEmitters = new HashMap<>();

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
    public ResponseEntity<Resource> avatarOfMember(
            final Integer memberId) {
        
        if (memberId == null) {
            return ResponseEntity.badRequest().build();
        }
        
        final var avatar = memberService.getAvatar(memberId);
        if (avatar.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity
                .ok()
                .cacheControl(CacheControl.maxAge(Duration.ofDays(365 * 10)))
                .body(new ByteArrayResource(avatar.get()));

    }
    
    @Override
    public ResponseEntity<Void> uploadAvatar(
            final Resource body) {
        
        try {
            
            final var png = body.getInputStream();
            if (png == null) {
                return ResponseEntity.badRequest().build();
            }
            
            memberService.saveAvatar(
                    userContext.getLoggedInMember().getMemberId(),
                    png);

            return ResponseEntity.ok().build();
        
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
        
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
        final var userInfoUri = UriComponentsBuilder.fromUriString(
                client.getProviderDetails().getUserInfoEndpoint().getUri()).build().toUri();
        final var userInfoRequestHeaders = new HttpHeaders();
        userInfoRequestHeaders.setBearerAuth(nativeLogin.getAccessToken());
        final var userInfoRequest = new HttpEntity<>(userInfoRequestHeaders);
        final var restTemplate = new RestTemplate();
        final var userInfoResponse = restTemplate.exchange(userInfoUri, HttpMethod.GET, userInfoRequest, Map.class);        
        
        final var oauth2Id = userInfoResponse.getBody().get(
                client.getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName());
        if ((oauth2Id == null)
                || !nativeLogin.getOauth2Id().equals(oauth2Id)) {
            logger.warn("Native login: For given oauth2Id '{}' the user2Id in user-info response does not match: '{}'!",
                    nativeLogin.getOauth2Id(),
                    oauth2Id);
            return ResponseEntity.badRequest().build();
        }
        
        final ElmoJwtToken authentication;
        final var member = memberService.getMemberByOAuth2User(nativeLogin.getOauth2Id());
        if (member.isEmpty()) {
            final var memberApplication = memberOnboarding.getMemberApplicationByOAuth2User(nativeLogin.getOauth2Id());
            if (memberApplication.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            authentication = JwtSecurityFilter.buildAuthentication(
                    ElmoOAuth2Provider.byRegistrationId(nativeLogin.getClientId()),
                    nativeLogin.getOauth2Id(),
                    null,
                    memberApplication.get());
        } else {
            authentication = JwtSecurityFilter.buildAuthentication(
                    ElmoOAuth2Provider.byRegistrationId(nativeLogin.getClientId()),
                    nativeLogin.getOauth2Id(),
                    member.get(),
                    null);
        }
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        JwtSecurityFilter.setToken((ElmoOAuth2User) authentication.getPrincipal());
        
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
    
    @Override
    public ResponseEntity<Void> takeoverMemberApplicationForm(
            final @Valid TakeoverMemberApplicationFormRequest takeoverMemberApplicationFormRequest) {
        
        final var application = userContext.getLoggedInMemberApplication();
        
        memberOnboarding.takeoverMemberApplicationByApplicant(
                application.getId(),
                takeoverMemberApplicationFormRequest.getTaskId());
        
        return ResponseEntity.ok().build();
        
    }
    
    @Override
    public ResponseEntity<MemberApplicationForm> loadMemberApplicationForm() {

        final var application = userContext.getLoggedInMemberApplication();

        return ResponseEntity.ok(
                mapper.toApplicationFormApi(application));

    }

    @Override
    public ResponseEntity<String> submitMemberApplicationForm(
            final MemberApplicationForm memberApplicationForm) {

        final var violations = new HashMap<String, String>();
        if (!StringUtils.hasText(memberApplicationForm.getFirstName())) {
            violations.put("firstName", "missing");
        }
        if (!StringUtils.hasText(memberApplicationForm.getLastName())) {
            violations.put("lastName", "missing");
        }
        if (memberApplicationForm.getBirthdate() == null) {
            violations.put("birthdate", "missing");
        }
        if (memberApplicationForm.getMemberId() == null) {
            if (memberApplicationForm.getSex() == null) {
                violations.put("sex", "missing");
            }
            if (!StringUtils.hasText(memberApplicationForm.getZip())) {
                violations.put("zip", "missing");
            }
            if (!StringUtils.hasText(memberApplicationForm.getCity())) {
                violations.put("city", "missing");
            }
            if (!StringUtils.hasText(memberApplicationForm.getStreet())) {
                violations.put("street", "missing");
            }
            if (!StringUtils.hasText(memberApplicationForm.getStreetNumber())) {
                violations.put("streetNumber", "missing");
            }
        }
        if (!StringUtils.hasText(memberApplicationForm.getEmail())) {
            violations.put("email", "missing");
        } else if (!emailService.isValidEmailAddressFormat(memberApplicationForm.getEmail())) {
            violations.put("email", "format");
        }
        if (!StringUtils.hasText(memberApplicationForm.getPhoneNumber())) {
            violations.put("phoneNumber", "missing");
        } else if (!smsService.isValidPhoneNumberFormat(memberApplicationForm.getPhoneNumber())) {
            violations.put("phoneNumber", "format");
        }
        if (!StringUtils.hasText(memberApplicationForm.getEmailConfirmationCode())) {
            violations.put("emailConfirmationCode", "missing");
            throw new ElmoValidationException(violations); // going ahead would cause DB failure
        } else if (memberApplicationForm.getEmailConfirmationCode().length() > 4) {
            violations.put("emailConfirmationCode", "format");
            throw new ElmoValidationException(violations); // going ahead would cause DB failure
        }
        if (!StringUtils.hasText(memberApplicationForm.getPhoneConfirmationCode())) {
            violations.put("phoneConfirmationCode", "missing");
            throw new ElmoValidationException(violations); // going ahead would cause DB failure
        } else if (memberApplicationForm.getPhoneConfirmationCode().length() > 4) {
            violations.put("phoneConfirmationCode", "format");
            throw new ElmoValidationException(violations); // going ahead would cause DB failure
        }

        final var referNotificationsPerSms =
                memberApplicationForm.getPreferNotificationsPerSms() != null
                ? memberApplicationForm.getPreferNotificationsPerSms().booleanValue()
                : false;

        memberOnboarding.processMemberApplicationInformation(
                memberApplicationForm.getApplicationId(),
                memberApplicationForm.getTaskId(),
                MemberApplicationUpdate.REQUEST,
                violations,
                memberApplicationForm.getMemberId(),
                memberApplicationForm.getTitle(),
                memberApplicationForm.getFirstName(),
                memberApplicationForm.getLastName(),
                memberApplicationForm.getBirthdate() == null ? null
                        : LocalDate.parse(memberApplicationForm.getBirthdate()),
                mapper.toDomain(memberApplicationForm.getSex()),
                memberApplicationForm.getZip(),
                memberApplicationForm.getCity(),
                memberApplicationForm.getStreet(),
                memberApplicationForm.getStreetNumber(),
                memberApplicationForm.getEmail(),
                memberApplicationForm.getEmailConfirmationCode(),
                memberApplicationForm.getPhoneNumber(),
                memberApplicationForm.getPhoneConfirmationCode(),
                referNotificationsPerSms,
                memberApplicationForm.getComment(),
                memberApplicationForm.getApplicationComment(),
                null);
        
        if (!violations.isEmpty()) {
            throw new ElmoValidationException(violations);
        }

        return ResponseEntity.ok().build();
        
    }
    
    @Override
    public ResponseEntity<Void> requestEmailCode(
            final @NotNull @Valid String emailAddress) {
        
        final var application = userContext.getLoggedInMemberApplication();

        if (!emailService.isValidEmailAddressFormat(emailAddress)) {
            throw new ElmoValidationException("email", "format");
        }

        try {

            memberService.requestEmailCode(application, emailAddress);

        } catch (Exception e) {

            logger.error("Could not send email-confirmation code for member-application '{}'", application.getId(), e);
            return ResponseEntity.internalServerError().build();

        }

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<Void> requestPhoneCode(
            final @NotNull @Valid String phoneNumber) {

        final var application = userContext.getLoggedInMemberApplication();

        if (!smsService.isValidPhoneNumberFormat(phoneNumber)) {
            throw new ElmoValidationException("phoneNumber", "format");
        }
        
        try {
            
            memberService.requestPhoneCode(application, phoneNumber);
            
        } catch (Exception e) {
            
            logger.error("Could not send phone-confirmation code for member-application '{}'", application.getId(), e);
            return ResponseEntity.internalServerError().build();
            
        }

        return ResponseEntity.ok().build();
        
    }
    
    @RequestMapping(
            method = RequestMethod.GET,
            value = "/drivers/sms"
        )
    public SseEmitter smsSubscription(
            @NotNull @RequestParam(value = "phoneNo", required = true) String phoneNo) {
        
        final var smsEmitter = new SseEmitter(-1l);
        smsEmitters.put(phoneNo, smsEmitter);

        return smsEmitter;
        
    }
    
    @EventListener
    @Async
    protected void sendSms(
            final SmsEvent event) throws Exception {

        final var smsEmitter = smsEmitters.get(event.getSenderNumber());
        if (smsEmitter == null) {
            return;
        }

        smsEmitter.send(
                SseEmitter
                        .event()
                        .id(UUID.randomUUID().toString())
                        .data(event, MediaType.APPLICATION_JSON)
                        .name("SMS")
                        .reconnectTime(30000));

    }

    @Override
    public ResponseEntity<TextMessages> requestTextMessages(
            final @Valid TextMessageRequest textMessageRequest) {
        
        final var messages = smsService.getMessagesToSend(
                textMessageRequest.getSender());
        
        final var result = new TextMessages();
        result.setTextMessages(
                mapper.toTextMessageApi(messages));
        
        result.getTextMessages().forEach(msg -> logger.info("Sent SMS to {}", msg.getRecipient()));

        return ResponseEntity.ok(result);
        
    }

}
