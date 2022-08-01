package at.elmo.config.web;

import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.JdbcOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Transactional(propagation = Propagation.REQUIRES_NEW)
public class TransactionalJdbcOAuth2AuthorizedClientService
        extends JdbcOAuth2AuthorizedClientService {

    public TransactionalJdbcOAuth2AuthorizedClientService(
            final JdbcOperations jdbcOperations,
            final ClientRegistrationRepository clientRegistrationRepository) {
        
        super(jdbcOperations, clientRegistrationRepository);
        
    }
    
    @Override
    public <T extends OAuth2AuthorizedClient> T loadAuthorizedClient(
            final String clientRegistrationId,
            final String principalName) {
        
        return super.loadAuthorizedClient(clientRegistrationId, principalName);
        
    }
    
    @Override
    public void saveAuthorizedClient(
            final OAuth2AuthorizedClient authorizedClient,
            final Authentication principal) {
        
        super.saveAuthorizedClient(authorizedClient, principal);
        
    }

    @Override
    public void removeAuthorizedClient(
            final String clientRegistrationId,
            final String principalName) {
        
        super.removeAuthorizedClient(clientRegistrationId, principalName);
        
    }
    
}
