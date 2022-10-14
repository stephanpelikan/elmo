package at.elmo.member;

import at.elmo.administration.api.v1.MemberStatus;
import at.elmo.member.MemberService.MemberApplicationUpdate;
import at.elmo.member.login.RoleMembership;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(implementationName = "MemberAdministrationApiMapperImpl")
public abstract class AdministrationApiMapper extends AdministrationApiMapperBase {

    @Mapping(target = "avatar", source = "timestampOfAvatar")
    public abstract at.elmo.administration.api.v1.Member toApi(Member member);

    public abstract List<at.elmo.administration.api.v1.Member> toMemberApi(List<Member> members);

    protected at.elmo.administration.api.v1.Role toApi(RoleMembership roleMembership) {

        return at.elmo.administration.api.v1.Role.fromValue(roleMembership.getRole().name());

    }

    public abstract at.elmo.member.Member.Status toDomain(MemberStatus status);

    public abstract MemberApplicationUpdate toDomain(at.elmo.administration.api.v1.MemberApplicationUpdate action);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "oauth2Ids", ignore = true)
    @Mapping(target = "emailForConfirmationCode", ignore = true)
    @Mapping(target = "phoneForConfirmationCode", ignore = true)
    @Mapping(target = "generatedEmailConfirmationCode", ignore = true)
    @Mapping(target = "generatedPhoneConfirmationCode", ignore = true)
    @Mapping(target = "timestampOfAvatar", ignore = true)
    @Mapping(target = "hoursServedPassangerService", ignore = true)
    @Mapping(target = "hoursConsumedCarSharing", ignore = true)
    public abstract Member toDomain(at.elmo.administration.api.v1.Member member);

}
