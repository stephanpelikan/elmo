package at.elmo.member;

import java.util.LinkedList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.OneToMany;

import at.elmo.member.login.OAuth2Identifier;
import at.elmo.member.login.RoleMembership;

@Entity
@DiscriminatorValue("M")
public class Member extends MemberBase {

    public static enum Status {
        ACTIVE,
        INACTIVE,
        TO_BE_DELETED
    };
    
    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY, cascade = { CascadeType.MERGE, CascadeType.PERSIST,
            CascadeType.DETACH })
    private List<OAuth2Identifier> oauth2Ids;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private Status status;

    @OneToMany(mappedBy = "member", fetch = FetchType.EAGER, cascade = { CascadeType.MERGE, CascadeType.PERSIST,
            CascadeType.DETACH })
    private List<RoleMembership> roles = new LinkedList<>();

    public List<OAuth2Identifier> getOauth2Ids() {
        return oauth2Ids;
    }

    public void setOauth2Ids(List<OAuth2Identifier> oauth2Ids) {
        this.oauth2Ids = oauth2Ids;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public List<RoleMembership> getRoles() {
        return roles;
    }
    
    public void setRoles(List<RoleMembership> roles) {
        this.roles = roles;
    }
    
    public void addRole(
            final Role role) {
        
        final var membership = new RoleMembership();
        membership.setMember(this);
        membership.setRole(role);
        roles.add(membership);
        
    }
    
    public void removeRole(
            final Role role) {

        final var membership = new RoleMembership();
        membership.setMember(this);
        membership.setRole(role);
        roles.remove(membership);
        
    }
    
    public boolean hasRole(
            final Role role) {
        
        return roles
                .stream()
                .filter(membership -> membership.getRole().equals(role))
                .findFirst()
                .isPresent();
        
    }
    
}
