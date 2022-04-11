package at.elmo.api.gui;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import at.elmo.api.gui.v1.Role;
import at.elmo.api.gui.v1.Sex;
import at.elmo.api.gui.v1.User;
import at.elmo.member.login.RoleMembership;

@Mapper
public abstract class GuiMapper {

    @Mapping(target = "name", source = "lastName")
    public abstract User toApi(at.elmo.member.Member user);

    protected Role toApi(RoleMembership roleMembership) {

        return Role.fromValue(roleMembership.getRole().name());

    }

    public abstract at.elmo.member.Member.Sex toDomain(Sex sex);

}
