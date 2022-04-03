package at.elmo.user;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import at.elmo.user.User.Status;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {

        this.userRepository = userRepository;
        
    }
    
    public Optional<User> getUserByOauth2Id(
            final String oauth2Id) {

        return userRepository.findByOauth2Id(oauth2Id);
        
    }
    
    public User loadOrRegisterUser(
            final OAuth2User oAuth2User) {
        
        final String oauth2Id = oAuth2User.getAttribute("sub");
        
        final Optional<User> user = userRepository.findByOauth2Id(oauth2Id);
        if (user.isPresent()) {
            return user.get();
        }

        final boolean emailVerified = oAuth2User.getAttribute("email_verified");

        final var newUser = new User();
        newUser.setId(UUID.randomUUID().toString());
        newUser.setOauth2Id(oauth2Id);
        newUser.setEmail(oAuth2User.getAttribute("email"));
        newUser.setStatus(emailVerified ? Status.EMAIL_VERIFIED : Status.NEW);
        newUser.setName(oAuth2User.getAttribute("name"));
        newUser.setFirstName(oAuth2User.getAttribute("given_name"));
        // picture=https://lh3.googleusercontent.com/a/AATXAJxL1ZUhshyuMwANp3bb3muwAxxFtqbsbOJ9DH1v=s96-c
        
        return userRepository.saveAndFlush(newUser);
        
    }
    
}
