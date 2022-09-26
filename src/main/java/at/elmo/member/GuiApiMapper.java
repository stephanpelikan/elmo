package at.elmo.member;

import at.elmo.gui.api.v1.Member;
import at.elmo.util.mapper.GuiApiMapperBase;
import org.mapstruct.Mapper;

@Mapper(implementationName = "MemberGuiApiMapperImpl")
public abstract class GuiApiMapper extends GuiApiMapperBase {

    public abstract Member toApi(at.elmo.member.Member member);

}
