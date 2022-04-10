package at.elmo.api.gui;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import at.elmo.api.gui.v1.Sex;
import at.elmo.api.gui.v1.User;

@Mapper
public interface GuiMapper {

    @Mapping(target = "female", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "name", source = "lastName")
    User toApi(at.elmo.member.Member user);

    at.elmo.member.Member.Sex toDomain(Sex sex);

}
