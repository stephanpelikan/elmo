package at.elmo.reservation.passangerservice.shift;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(implementationName = "ShiftAdministrationApiMapperImpl")
public abstract class AdministrationApiMapper {

    @Mapping(target = "driverId", source = "driver.id")
    @Mapping(target = "carId", source = "car.id")
    public abstract at.elmo.administration.api.v1.Shift toApi(Shift shift);

    public abstract List<at.elmo.administration.api.v1.Shift> toApi(List<Shift> shifts);

}
