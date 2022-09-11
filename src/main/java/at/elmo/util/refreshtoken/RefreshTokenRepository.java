package at.elmo.util.refreshtoken;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import at.elmo.member.login.ElmoOAuth2Provider;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {

    Optional<RefreshToken> findByProviderAndOauth2Id(
            ElmoOAuth2Provider provider,
            String oauth2Id);
    
}
