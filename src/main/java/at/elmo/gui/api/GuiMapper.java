package at.elmo.gui.api;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import at.elmo.gui.api.v1.MemberApplicationForm;
import at.elmo.gui.api.v1.Role;
import at.elmo.gui.api.v1.Sex;
import at.elmo.gui.api.v1.User;
import at.elmo.gui.api.v1.UserStatus;
import at.elmo.member.Member;
import at.elmo.member.login.RoleMembership;
import at.elmo.member.onboarding.MemberApplication;

@Mapper
public abstract class GuiMapper {

    @Mapping(target = "name", source = "lastName")
    public abstract User toApi(at.elmo.member.Member user);

    protected Role toApi(RoleMembership roleMembership) {

        return Role.fromValue(roleMembership.getRole().name());

    }

    @Mapping(target = "applicationId", source = "application.id")
    @Mapping(target = "taskId", source = "application.userTaskId")
    @Mapping(target = "emailConfirmationCode", source = "application.lastEmailConfirmationCode")
    @Mapping(target = "phoneConfirmationCode", source = "application.lastPhoneConfirmationCode")

    @Mapping(target = "email", expression = "java(application.getEmail() != null ? application.getEmail() : member.getEmail())")
    @Mapping(target = "phoneNumber", expression = "java(application.getPhoneNumber() != null ? application.getPhoneNumber() : member.getPhoneNumber())")
    public abstract MemberApplicationForm toApplicationFormApi(Member member, MemberApplication application);

    public abstract at.elmo.member.Member.Sex toDomain(Sex sex);

    public abstract at.elmo.member.Member.Status toDomain(UserStatus status);

}
