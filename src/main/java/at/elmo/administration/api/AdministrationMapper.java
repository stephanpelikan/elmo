package at.elmo.administration.api;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import at.elmo.administration.api.v1.Member;
import at.elmo.administration.api.v1.MemberApplication;
import at.elmo.administration.api.v1.Page;
import at.elmo.administration.api.v1.Role;
import at.elmo.administration.api.v1.Sex;
import at.elmo.member.login.RoleMembership;

@Mapper
public abstract class AdministrationMapper {

    public abstract Member toApi(at.elmo.member.Member user);

    protected Role toApi(RoleMembership roleMembership) {

        return Role.fromValue(roleMembership.getRole().name());

    }

    public abstract at.elmo.member.Member.Sex toDomain(Sex sex);
    
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastEmailConfirmationCode", ignore = true)
    @Mapping(target = "lastPhoneConfirmationCode", ignore = true)
    @Mapping(target = "oauth2Ids", ignore = true)
    public abstract at.elmo.member.Member toDomain(Member member);

    public abstract MemberApplication toApi(at.elmo.member.onboarding.MemberApplication application);

    public abstract List<MemberApplication> toApi(List<at.elmo.member.onboarding.MemberApplication> application);

    public Page toApi(org.springframework.data.domain.Page<?> page) {

        final var result = new Page();
        result.setNumber(page.getNumber());
        result.setSize(page.getSize());
        result.setTotalElements(page.getTotalElements());
        result.setTotalPages(page.getTotalPages());
        return result;

    }

}
