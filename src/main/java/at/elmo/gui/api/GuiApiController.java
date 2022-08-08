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

import at.elmo.gui.api.v1.GuiApi;
import at.elmo.gui.api.v1.MemberApplicationForm;
import at.elmo.gui.api.v1.Oauth2Client;
import at.elmo.gui.api.v1.User;
import at.elmo.member.MemberService;
import at.elmo.member.MemberService.MemberApplicationUpdate;
import at.elmo.util.UserContext;
import at.elmo.util.email.EmailService;
import at.elmo.util.exceptions.ElmoException;
import at.elmo.util.exceptions.ElmoValidationException;

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
    private MemberService memberService;

    @Autowired
    private GuiMapper mapper;

    @Autowired
    private EmailService emailService;

    @Override
    public ResponseEntity<User> currentUser() {

        try {

            final var user = userContext.getLoggedInMember();
            return ResponseEntity.ok(mapper.toApi(user));

        } catch (ElmoException e) {

            return ResponseEntity.notFound().build();

        }

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
    public ResponseEntity<MemberApplicationForm> loadMemberApplicationForm() {

        final var user = userContext.getLoggedInMember();

        final var application = memberService.getCurrentMemberApplication(user.getId());
        if (application.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                mapper.toApplicationFormApi(application.get().getMember(), application.get()));

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
        } else if (!memberApplicationForm.getPhoneNumber().startsWith("+")) {
            violations.put("phoneNumber", "format");
        }
        if (!violations.isEmpty()) {
            throw new ElmoValidationException(violations);
        }

        final var referNotificationsPerSms =
                memberApplicationForm.getPreferNotificationsPerSms() != null
                ? memberApplicationForm.getPreferNotificationsPerSms().booleanValue()
                : false;

        memberService.processMemberApplicationInformation(
                memberApplicationForm.getApplicationId(),
                memberApplicationForm.getTaskId(),
                MemberApplicationUpdate.INQUIRY,
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
        
        return ResponseEntity.ok().build();
        
    }
    
    @Override
    public ResponseEntity<Void> requestEmailCode(
            final @NotNull @Valid String emailAddress) {
        
        final var user = userContext.getLoggedInMember();

        final var application = memberService.getCurrentMemberApplication(user.getId());
        if (application.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            
            memberService.requestEmailCode(user, emailAddress);
            
        } catch (Exception e) {
            
            logger.error("Could not send email-confirmation code for member '{}'", user.getId(), e);
            return ResponseEntity.internalServerError().build();
            
        }

        return ResponseEntity.ok().build();
        
    }
    
}
