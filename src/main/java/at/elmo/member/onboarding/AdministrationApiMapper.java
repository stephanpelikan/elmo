package at.elmo.member.onboarding;

import at.elmo.member.AdministrationApiMapperBase;
import at.elmo.member.MemberService.MemberApplicationUpdate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public abstract class AdministrationApiMapper extends AdministrationApiMapperBase {

    public abstract MemberApplicationUpdate toDomain(at.elmo.administration.api.v1.MemberApplicationUpdate action);

    @Mapping(target = "taskId", source = "userTaskId")
    public abstract at.elmo.administration.api.v1.MemberApplication toApi(MemberApplication application);

    public abstract List<at.elmo.administration.api.v1.MemberApplication> toApi(
            List<MemberApplication> applications);

}
