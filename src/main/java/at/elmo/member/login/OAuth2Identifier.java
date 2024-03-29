package at.elmo.member.login;

import at.elmo.member.MemberBase;
import at.elmo.util.spring.PersistenceBase;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "ELMO_OAUTH_ID")
public class OAuth2Identifier extends PersistenceBase<String> {

    @Id
    @Column(name = "ID")
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "OWNER", nullable = false, updatable = true)
    private MemberBase owner;

    @Column(name = "PROVIDER")
    private ElmoOAuth2Provider provider;

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public MemberBase getOwner() {
        return owner;
    }

    public void setOwner(MemberBase owner) {
        this.owner = owner;
    }

    public ElmoOAuth2Provider getProvider() {
        return provider;
    }

    public void setProvider(ElmoOAuth2Provider provider) {
        this.provider = provider;
    }

}
