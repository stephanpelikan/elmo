package at.elmo.administration.api;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import at.elmo.administration.api.v1.Member;
import at.elmo.administration.api.v1.MemberApplication;
import at.elmo.administration.api.v1.MemberApplicationUpdate;
import at.elmo.administration.api.v1.MemberStatus;
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

    public abstract at.elmo.member.Role toDomain(Role role);

    public abstract at.elmo.member.Member.Status toDomain(MemberStatus status);

    public abstract at.elmo.member.Member.Sex toDomain(Sex sex);
    
    public abstract at.elmo.member.MemberService.MemberApplicationUpdate toDomain(MemberApplicationUpdate action);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "oauth2Ids", ignore = true)
    @Mapping(target = "givenEmailConfirmationCode", ignore = true)
    @Mapping(target = "givenPhoneConfirmationCode", ignore = true)
    @Mapping(target = "generatedEmailConfirmationCode", ignore = true)
    @Mapping(target = "generatedPhoneConfirmationCode", ignore = true)
    public abstract at.elmo.member.Member toDomain(Member member);

    @Mapping(target = "taskId", source = "userTaskId")
    @Mapping(target = "member", ignore = true)
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


    @Mapping(target = "driverId", source = "driver.id")
    @Mapping(target = "carId", source = "car.id")
    public abstract at.elmo.administration.api.v1.Shift toApi(at.elmo.reservation.shift.Shift shift);
    public abstract List<at.elmo.administration.api.v1.Shift> toApiShifts(List<at.elmo.reservation.shift.Shift> shifts);



}
