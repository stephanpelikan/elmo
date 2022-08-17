package at.elmo.gui.api;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import at.elmo.gui.api.v1.MemberApplicationForm;
import at.elmo.gui.api.v1.Role;
import at.elmo.gui.api.v1.Sex;
import at.elmo.gui.api.v1.User;
import at.elmo.gui.api.v1.UserStatus;
import at.elmo.member.login.RoleMembership;
import at.elmo.member.onboarding.MemberApplication;

@Mapper
public abstract class GuiMapper {

    @Mapping(target = "name", source = "lastName")
    @Mapping(target = "roles", expression = "java(toRoles(member))")
    @Mapping(target = "status", expression = "java(toUserStatus(member))")
    public abstract User toApi(at.elmo.member.Member member);

    @Mapping(target = "name", source = "lastName")
    @Mapping(target = "roles", expression = "java(java.util.List.of())")
    @Mapping(target = "status", expression = "java(toUserStatus(application))")
    public abstract User toApi(MemberApplication application);

    protected List<Role> toRoles(at.elmo.member.Member member) {

        switch (member.getStatus()) {
        case INACTIVE:
        case TO_BE_DELETED:
            return List.of();
        default:
            return toApi(member.getRoles());
        }
    }

    protected UserStatus toUserStatus(at.elmo.member.onboarding.MemberApplication application) {

        switch (application.getStatus()) {
        case DATA_INVALID:
            return UserStatus.DATA_INVALID;
        case NEW:
            return UserStatus.NEW;
        case APPLICATION_SUBMITTED:
            return UserStatus.APPLICATION_SUBMITTED;
        case REJECTED:
            return UserStatus.REJECTED;
        default:
            return null;
        }

    }

    protected UserStatus toUserStatus(at.elmo.member.Member member) {

        switch (member.getStatus()) {
        case ACTIVE:
            return UserStatus.ACTIVE;
        case INACTIVE:
        case TO_BE_DELETED:
            return UserStatus.INACTIVE;
        default:
            return null;
        }

    }

    protected Role toApi(RoleMembership roleMembership) {

        return Role.fromValue(roleMembership.getRole().name());

    }

    protected abstract List<Role> toApi(List<RoleMembership> roleMembership);

    @Mapping(target = "applicationId", source = "id")
    @Mapping(target = "taskId", source = "userTaskId")
    @Mapping(target = "emailConfirmationCode", source = "givenEmailConfirmationCode")
    @Mapping(target = "phoneConfirmationCode", source = "givenPhoneConfirmationCode")
    public abstract MemberApplicationForm toApplicationFormApi(MemberApplication application);

    public abstract at.elmo.member.Member.Sex toDomain(Sex sex);

}
