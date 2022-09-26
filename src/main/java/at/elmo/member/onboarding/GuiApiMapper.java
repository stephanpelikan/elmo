package at.elmo.member.onboarding;

import at.elmo.gui.api.v1.MemberApplicationForm;
import at.elmo.util.mapper.GuiApiMapperBase;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(implementationName = "OnboardingGuiApiMapperImpl")
public abstract class GuiApiMapper extends GuiApiMapperBase {

    @Mapping(target = "applicationId", source = "id")
    @Mapping(target = "taskId", source = "userTaskId")
    @Mapping(target = "emailConfirmationCode", ignore = true)
    @Mapping(target = "phoneConfirmationCode", ignore = true)
    public abstract MemberApplicationForm toApi(MemberApplication application);

}
