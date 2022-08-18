package at.elmo.member.login;

import java.io.Serializable;

import at.elmo.member.Member;
import at.elmo.member.Role;

public class RoleMembershipId implements Serializable {

    private static final long serialVersionUID = 1L;

    private Role role;

    private Member member;

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

    @Override
    public boolean equals(Object obj) {

        if (obj == null) {
            return false;
        }
        if (!(obj instanceof RoleMembershipId)) {
            return false;
        }
        final var other = (RoleMembershipId) obj;
        if (!role.equals(other.role)) {
            return false;
        }
        return member.equals(other.member);

    }

    @Override
    public int hashCode() {

        int hash = 7;
        hash = 31 * hash + role.hashCode();
        hash = 31 * hash + member.getId().hashCode();
        return hash;

    }

}
