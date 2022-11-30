package at.elmo.util.mapper;

import at.elmo.administration.api.v1.Page;

public abstract class AdministrationApiMapperBase extends MapperBase {

    public Page toApi(org.springframework.data.domain.Page<?> page) {

        final var result = new Page();
        result.setNumber(page.getNumber());
        result.setSize(page.getSize());
        result.setTotalElements(page.getTotalElements());
        result.setTotalPages(page.getTotalPages());
        return result;

    }

}
