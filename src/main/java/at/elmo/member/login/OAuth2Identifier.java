package at.elmo.member.login;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import at.elmo.member.Member;

@Entity
@Table(name = "ELMO_OAUTH_IDS")
public class OAuth2Identifier {

    @Id
    @Column(name = "ID")
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "OWNER", nullable = false, updatable = false)
    private Member owner;

    @Column(name = "PROVIDER")
    private ElmoOAuth2Provider provider;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Member getOwner() {
        return owner;
    }

    public void setOwner(Member owner) {
        this.owner = owner;
    }

    public ElmoOAuth2Provider getProvider() {
        return provider;
    }

    public void setProvider(ElmoOAuth2Provider provider) {
        this.provider = provider;
    }

}
