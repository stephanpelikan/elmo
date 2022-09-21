package at.elmo.car;

import at.elmo.util.AdministrationApiMapperBase;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public abstract class AdministrationApiMapper extends AdministrationApiMapperBase {

    @Mapping(target = "lastAppActivity", ignore = true)
    public abstract at.elmo.administration.api.v1.Car toApi(Car car);

    public abstract List<at.elmo.administration.api.v1.Car> toApi(List<Car> cars);

}
