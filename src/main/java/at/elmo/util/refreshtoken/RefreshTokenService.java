package at.elmo.util.refreshtoken;

import at.elmo.config.ElmoProperties;
import at.elmo.member.login.ElmoOAuth2Provider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Autowired
    private ElmoProperties properties;

    @Autowired
    private RefreshTokenRepository refreshTokens;

    public void deleteRefreshToken(
            final String oauth2Id,
            final ElmoOAuth2Provider provider) {

        final var oldToken = refreshTokens.findByProviderAndOauth2Id(provider, oauth2Id);
        if (oldToken.isEmpty()) {
            return;
        }

        refreshTokens.delete(oldToken.get());

    }

    public String buildRefreshToken(
            final String oauth2Id,
            final ElmoOAuth2Provider provider) {

        final var oldToken = refreshTokens.findByProviderAndOauth2Id(provider, oauth2Id);
        if (oldToken.isPresent()) {
            refreshTokens.delete(oldToken.get());
        }

        final var newToken = new RefreshToken();
        newToken.setToken(UUID.randomUUID().toString());
        newToken.setOauth2Id(oauth2Id);
        newToken.setProvider(provider);

        refreshTokens.saveAndFlush(newToken);

        return newToken.getToken();

    }

    public RefreshToken consumeRefreshToken(
            final String refreshToken) {

        final var oldToken = refreshTokens.findById(refreshToken);
        if (oldToken.isEmpty()) {
            return null;
        }

        final var ageOfToken = Duration.between(
                oldToken.get().getCreatedAt(),
                LocalDateTime.now());

        // refresh token expired
        if (ageOfToken.compareTo(properties.getRefreshTokenLifetime()) == 1) {
            refreshTokens.delete(oldToken.get());
            return null;
        }

        final var newToken = new RefreshToken();
        newToken.setToken(UUID.randomUUID().toString());
        newToken.setOauth2Id(oldToken.get().getOauth2Id());
        newToken.setProvider(oldToken.get().getProvider());

        refreshTokens.delete(oldToken.get());

        return refreshTokens.saveAndFlush(newToken);

    }

    public LocalDateTime hasRefreshToken(
            final String oauth2Id,
            final ElmoOAuth2Provider provider) {

        final var token = refreshTokens.findByProviderAndOauth2Id(provider, oauth2Id);
        if (token.isEmpty()) {
            return null;
        }

        return token.get().getCreatedAt();

    }

}
