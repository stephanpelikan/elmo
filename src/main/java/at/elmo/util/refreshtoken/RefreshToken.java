package at.elmo.util.refreshtoken;

import java.time.OffsetDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;

import at.elmo.member.login.ElmoOAuth2Provider;

@Entity
@Table(name = "ELMO_REFRESH_TOKEN")
public class RefreshToken {

    public static final String HEADER_NAME = "X-Refresh-Token";

    @Id
    @Column(name = "TOKEN")
    private String token;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @Column(name = "ID")
    private String oauth2Id;

    @Column(name = "PROVIDER")
    private ElmoOAuth2Provider provider;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getOauth2Id() {
        return oauth2Id;
    }

    public void setOauth2Id(String oauth2Id) {
        this.oauth2Id = oauth2Id;
    }

    public ElmoOAuth2Provider getProvider() {
        return provider;
    }

    public void setProvider(ElmoOAuth2Provider provider) {
        this.provider = provider;
    }

}
