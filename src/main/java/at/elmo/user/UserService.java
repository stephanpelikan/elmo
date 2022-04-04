package at.elmo.user;

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
        
        return userRepository.findByOauth2Id(oauth2User.getOAuth2Id());
        
    }
    
    public User loadOrRegisterUser(
            final ElmoOAuth2User oAuth2User) {
        
        final String oauth2Id = oAuth2User.getOAuth2Id();
        
        final Optional<User> user = userRepository.findByOauth2Id(oauth2Id);
        if (user.isPresent()) {
            return user.get();
        }

        final boolean emailVerified = oAuth2User.isEmailVerified();

        final var newUser = new User();
        newUser.setId(UUID.randomUUID().toString());
        newUser.setOauth2Id(oauth2Id);
        newUser.setEmail(oAuth2User.getEmail());
        newUser.setStatus(emailVerified ? Status.EMAIL_VERIFIED : Status.NEW);
        newUser.setName(oAuth2User.getName());
        newUser.setFirstName(oAuth2User.getFirstName());
        
        return userRepository.saveAndFlush(newUser);
        
    }
    
}
