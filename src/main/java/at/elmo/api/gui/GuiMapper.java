package at.elmo.api.gui;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import at.elmo.api.gui.v1.User;

@Mapper
public interface GuiMapper {

    @Mapping(target = "female", ignore = true)
    @Mapping(target = "roles", ignore = true)
    User toApi(at.elmo.user.User user);

}
