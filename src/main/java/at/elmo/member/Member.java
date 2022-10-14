package at.elmo.member;

import at.elmo.member.login.OAuth2Identifier;
import at.elmo.member.login.RoleMembership;

import java.util.Arrays;
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

@Entity
@DiscriminatorValue("M")
public class Member extends MemberBase {

    public static enum Status {
        ACTIVE,
        INACTIVE,
        TO_BE_DELETED
    };

    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY, cascade = { CascadeType.ALL }, orphanRemoval = true)
    private List<OAuth2Identifier> oauth2Ids;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private Status status;

    @Column(name = "AVATAR")
    private Long timestampOfAvatar;

    @Column(name = "PS_HOURS")
    private int hoursServedPassangerService;

    @Column(name = "CS_HOURS")
    private int hoursConsumedCarSharing;

    @OneToMany(mappedBy = "member", fetch = FetchType.EAGER, cascade = { CascadeType.ALL }, orphanRemoval = true)
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

    public Long getTimestampOfAvatar() {
        return timestampOfAvatar;
    }

    public void setTimestampOfAvatar(Long timestampOfAvatar) {
        this.timestampOfAvatar = timestampOfAvatar;
    }

    public int getHoursConsumedCarSharing() {
        return hoursConsumedCarSharing;
    }

    public void setHoursConsumedCarSharing(int hoursConsumedCarSharing) {
        this.hoursConsumedCarSharing = hoursConsumedCarSharing;
    }

    public int getHoursServedPassangerService() {
        return hoursServedPassangerService;
    }

    public void setHoursServedPassangerService(int hoursServedPassangerService) {
        this.hoursServedPassangerService = hoursServedPassangerService;
    }

    public void addRoles(
            final List<Role> newRoles) {

        newRoles.forEach(role -> addRole(role));

    }

    public void updateRoles(
            final List<Role> newRoles) {

        Arrays
                .stream(Role.values())
                .filter(potentialRole -> !newRoles.contains(potentialRole))
                .forEach(role -> removeRole(role));

        addRoles(newRoles);

    }

    public void addRole(
            final Role role) {

        roles
                .stream()
                .filter(existingRole -> existingRole.getRole() == role)
                .findFirst()
                .ifPresentOrElse(
                        (existingRole) -> {},
                        () -> {
                            final var membership = new RoleMembership();
                            membership.setMember(this);
                            membership.setRole(role);
                            roles.add(membership);
                        });

    }

    public void removeRole(
            final Role role) {

        roles
                .stream()
                .filter(existingRole -> existingRole.getRole() == role)
                .findFirst()
                .ifPresent((existingRole) -> {
                    roles.remove(existingRole);
                });

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
