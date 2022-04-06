package at.elmo.user;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "ELMO_OAUTH_IDS")
public class OAuth2Identifier {

    @Id
    @Column(name = "ID")
    private String id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "OWNER", nullable = false, updatable = false)
    private User owner;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

}
