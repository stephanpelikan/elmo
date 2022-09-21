package at.elmo.util.mapper;

import at.elmo.member.MemberBase.Sex;
import at.elmo.member.Role;

public abstract class GuiApiMapperBase {

    public abstract Role toDomain(at.elmo.gui.api.v1.Role role);

    public abstract Sex toDomain(at.elmo.gui.api.v1.Sex sex);

}
