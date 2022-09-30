package at.elmo.util.refreshtoken;

import at.elmo.member.login.ElmoOAuth2Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {

    List<RefreshToken> findByProviderAndOauth2Id(
            ElmoOAuth2Provider provider,
            String oauth2Id);

}
