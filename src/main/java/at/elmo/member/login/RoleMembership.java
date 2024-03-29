package at.elmo.member.login;

import at.elmo.member.Member;
import at.elmo.member.Role;
import at.elmo.util.spring.PersistenceBase;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "ELMO_MEMBER_ROLE")
@IdClass(RoleMembershipId.class)
public class RoleMembership extends PersistenceBase<Role> {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE")
    private Role role;

    @Id
    @ManyToOne(optional = false)
    @JoinColumn(name = "MEMBER", nullable = false, updatable = false)
    private Member member;

    @Override
    public Role getId() {
        return getRole();
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Member getMember() {
        return member;
    }

    public void setMember(Member member) {
        this.member = member;
    }

}
