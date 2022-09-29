package at.elmo.util.refreshtoken;

import at.elmo.member.login.ElmoOAuth2Provider;
import at.elmo.util.spring.PersistenceBase;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "ELMO_REFRESH_TOKEN")
public class RefreshToken extends PersistenceBase<String> {

    public static final String HEADER_NAME = "X-Refresh-Token";

    @Id
    @Column(name = "TOKEN")
    private String token;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime createdAt;

    @Column(name = "ID")
    private String oauth2Id;

    @Column(name = "PROVIDER")
    private ElmoOAuth2Provider provider;

    @Override
    public String getId() {
        return getToken();
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
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
