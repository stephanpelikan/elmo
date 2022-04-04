package at.elmo.api.gui;

import java.util.LinkedList;
import java.util.List;

import org.springframework.core.ResolvableType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.stereotype.Component;

import at.elmo.api.gui.v1.GuiApiDelegate;
import at.elmo.api.gui.v1.Oauth2Client;
import at.elmo.api.gui.v1.User;
import at.elmo.user.UserService;

@Component
public class GuiApiDelegateImpl implements GuiApiDelegate {

    private final ClientRegistrationRepository clientRegistrationRepository;
    
    private final UserService userService;
    
    private final GuiMapper mapper;

    public GuiApiDelegateImpl(
            final ClientRegistrationRepository clientRegistrationRepository,
            final UserService userService, final GuiMapper mapper) {

        this.clientRegistrationRepository = clientRegistrationRepository;
        this.userService = userService;
        this.mapper = mapper;
        
    }

    @Override
    public ResponseEntity<User> currentUser() {

        final var user = userService.getCurrentUser();
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

}
