package at.elmo.gui.api;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ResolvableType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import at.elmo.config.ElmoProperties;
import at.elmo.gui.api.v1.AppInformation;
import at.elmo.gui.api.v1.GuiApi;
import at.elmo.gui.api.v1.MemberApplicationForm;
import at.elmo.gui.api.v1.Oauth2Client;
import at.elmo.gui.api.v1.TakeoverMemberApplicationFormRequest;
import at.elmo.gui.api.v1.User;
import at.elmo.member.MemberService;
import at.elmo.member.MemberService.MemberApplicationUpdate;
import at.elmo.member.onboarding.MemberOnboarding;
import at.elmo.util.UserContext;
import at.elmo.util.email.EmailService;
import at.elmo.util.exceptions.ElmoException;
import at.elmo.util.exceptions.ElmoValidationException;
import at.elmo.util.sms.SmsService;

@RestController
@RequestMapping("/api/v1")
public class GuiApiController implements GuiApi {

    @Autowired
    private Logger logger;
    
    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;
    
    @Autowired
    private UserContext userContext;

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

    @Override
    public ResponseEntity<User> currentUser() {

        try {
            
            final var member = userContext.getLoggedInMember();
            if (member != null) {
                return ResponseEntity.ok(mapper.toApi(member));
            }
    
            final var application = userContext.getLoggedInMemberApplication();
            return ResponseEntity.ok(mapper.toApi(application));

        } catch (ElmoException e) {

            return ResponseEntity.notFound().build();

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

    @SuppressWarnings("unchecked")
    @Override
    public ResponseEntity<List<Oauth2Client>> oauth2Clients() {

        final var type = ResolvableType.forInstance(clientRegistrationRepository).as(Iterable.class);
        if (type == ResolvableType.NONE || !ClientRegistration.class.isAssignableFrom(type.resolveGenerics()[0])) {
            return ResponseEntity.ok(List.of());
        }
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
//        if (memberApplicationForm.getMemberId() == null) {
//            violations.put("memberId", "missing");
//        }
        if (!StringUtils.hasText(memberApplicationForm.getFirstName())) {
            violations.put("firstName", "missing");
        }
        if (!StringUtils.hasText(memberApplicationForm.getLastName())) {
            violations.put("lastName", "missing");
        }
        if (memberApplicationForm.getBirthdate() == null) {
            violations.put("birthdate", "missing");
        }
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
            throw new ElmoValidationException(violations); // going ahead would case DB failure
        } else if (memberApplicationForm.getEmailConfirmationCode().length() > 4) {
            violations.put("emailConfirmationCode", "format");
            throw new ElmoValidationException(violations); // going ahead would case DB failure
        }
        if (!StringUtils.hasText(memberApplicationForm.getPhoneConfirmationCode())) {
            violations.put("phoneConfirmationCode", "missing");
            throw new ElmoValidationException(violations); // going ahead would case DB failure
        } else if (memberApplicationForm.getPhoneConfirmationCode().length() > 4) {
            violations.put("phoneConfirmationCode", "format");
            throw new ElmoValidationException(violations); // going ahead would case DB failure
        }

        final var referNotificationsPerSms =
                memberApplicationForm.getPreferNotificationsPerSms() != null
                ? memberApplicationForm.getPreferNotificationsPerSms().booleanValue()
                : false;

        memberService.processMemberApplicationInformation(
                memberApplicationForm.getApplicationId(),
                memberApplicationForm.getTaskId(),
                MemberApplicationUpdate.REQUEST,
                violations,
                null,
                memberApplicationForm.getFirstName(),
                memberApplicationForm.getLastName(),
                memberApplicationForm.getBirthdate(),
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
                memberApplicationForm.getComment());
        
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
            
            logger.error("Could not send email-confirmation code for member-application '{}'", application.getId(), e);
            return ResponseEntity.internalServerError().build();
            
        }

        return ResponseEntity.ok().build();
        
    }
    
}
