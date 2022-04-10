package at.elmo.api.gui;

import java.util.LinkedList;
import java.util.List;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ResolvableType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import at.elmo.api.gui.v1.GuiApi;
import at.elmo.api.gui.v1.MemberApplicationForm;
import at.elmo.api.gui.v1.Oauth2Client;
import at.elmo.api.gui.v1.User;
import at.elmo.member.MemberService;

@RestController
@RequestMapping("/api/v1")
public class GuiApiController implements GuiApi {

    @Autowired
    private Logger logger;

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;
    
    @Autowired
    private MemberService memberService;
    
    @Autowired
    private GuiMapper mapper;

    @Override
    public ResponseEntity<User> currentUser() {

        final var user = memberService.getCurrentUser();
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(mapper.toApi(user.get()));

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
    public ResponseEntity<String> submitMemberApplicationForm(
            final MemberApplicationForm memberApplicationForm) {

        final var referNotificationsPerSms =
                memberApplicationForm.getPreferNotificationsPerSms() != null
                ? memberApplicationForm.getPreferNotificationsPerSms().booleanValue()
                : false;
        
        final var phoneCountryCode =
                memberApplicationForm.getPhoneCountryCode().startsWith("+")
                ? memberApplicationForm.getPhoneCountryCode()
                : "+" + memberApplicationForm.getPhoneCountryCode();
        
        final var phoneProviderCode =
                memberApplicationForm.getPhoneProviderCode().startsWith("0")
                ? memberApplicationForm.getPhoneProviderCode().substring(1)
                : memberApplicationForm.getPhoneProviderCode();

        try {

            memberService.processMemberApplicationInformation(
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
                    phoneCountryCode + phoneProviderCode + memberApplicationForm.getPhoneNumber(),
                    memberApplicationForm.getPhoneConfirmationCode(),
                    referNotificationsPerSms);

        } catch (RuntimeException e) {
            logger.error("Could not process application form", e);
            return ResponseEntity.unprocessableEntity().build();
        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.unprocessableEntity().build();
        }
        
        return ResponseEntity.ok().build();
        
    }
    
}
