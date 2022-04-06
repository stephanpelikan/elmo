package at.elmo.user;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import at.elmo.user.User.Status;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {

        this.userRepository = userRepository;
        
    }
    
    public Optional<User> getCurrentUser() {
        
        final var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return Optional.empty();
        }
        if (!authentication.isAuthenticated()) {
            return Optional.empty();
        }
        if (!(authentication.getPrincipal() instanceof ElmoOAuth2User)) {
            return Optional.empty();
        }
        
        final var oauth2User = (ElmoOAuth2User) authentication.getPrincipal();
        
        return userRepository.findByOauth2Ids_Id(oauth2User.getOAuth2Id());
        
    }
    
    public User loadOrRegisterUser(
            final ElmoOAuth2User oAuth2User) {
        
        final String oauth2Id = oAuth2User.getOAuth2Id();
        
        final Optional<User> user = userRepository.findByOauth2Ids_Id(oauth2Id);
        if (user.isPresent()) {
            return user.get();
        }

        final boolean emailVerified = oAuth2User.isEmailVerified();

        final var newOAuth2Id = new OAuth2Identifier();
        newOAuth2Id.setId(oauth2Id);

        final var newUser = new User();
        newOAuth2Id.setOwner(newUser);

        newUser.setOauth2Ids(List.of(newOAuth2Id));
        newUser.setId(UUID.randomUUID().toString());
        newUser.setEmail(oAuth2User.getEmail());
        newUser.setStatus(emailVerified ? Status.EMAIL_VERIFIED : Status.NEW);
        newUser.setName(oAuth2User.getName());
        newUser.setFirstName(oAuth2User.getFirstName());
        
        return userRepository.saveAndFlush(newUser);
        
    }
    
}
