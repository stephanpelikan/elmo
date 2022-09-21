package at.elmo.car;

import at.elmo.administration.api.v1.Car;
import at.elmo.util.MapperBase;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public abstract class CarAdministrationMapper extends MapperBase {

    @Mapping(target = "lastAppActivity", ignore = true)
    public abstract Car toApi(at.elmo.car.Car car);

    public abstract List<Car> toApi(List<at.elmo.car.Car> cars);

}
