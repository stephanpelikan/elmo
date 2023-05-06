package at.elmo.util.mapper;

import at.elmo.gui.api.v1.Page;
import at.elmo.member.MemberBase.Sex;
import at.elmo.member.Role;

public abstract class GuiApiMapperBase {

    public abstract Role toDomain(at.elmo.gui.api.v1.Role role);

    public abstract Sex toDomain(at.elmo.gui.api.v1.Sex sex);

    public Page toApi(org.springframework.data.domain.Page<?> page) {

        final var result = new Page();
        result.setNumber(page.getNumber());
        result.setSize(page.getSize());
        result.setTotalElements(page.getTotalElements());
        result.setTotalPages(page.getTotalPages());
        return result;

    }

}
