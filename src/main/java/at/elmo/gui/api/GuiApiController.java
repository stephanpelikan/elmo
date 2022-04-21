package at.elmo.gui.api;

import java.util.LinkedList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ResolvableType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import at.elmo.gui.api.v1.GuiApi;
import at.elmo.gui.api.v1.MemberApplicationForm;
import at.elmo.gui.api.v1.Oauth2Client;
import at.elmo.gui.api.v1.User;
import at.elmo.member.Member.Status;
import at.elmo.member.MemberService;
import at.elmo.util.ElmoException;
import at.elmo.util.UserContext;

@RestController
@RequestMapping("/api/v1")
public class GuiApiController implements GuiApi {

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;
    
    @Autowired
    private UserContext userContext;

    @Autowired
    private MemberService memberService;

    @Autowired
    private GuiMapper mapper;

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

        memberService.processMemberApplicationInformation(
                memberApplicationForm.getApplicationId(),
                Status.APPLICATION_SUBMITTED,
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
        
        return ResponseEntity.ok().build();
        
    }
    
}
