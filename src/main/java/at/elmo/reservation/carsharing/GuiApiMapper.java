package at.elmo.reservation.carsharing;

import at.elmo.gui.api.v1.CarSharingReservation;
import at.elmo.util.mapper.GuiApiMapperBase;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(implementationName = "CarSharingGuiApiMapperImpl")
public abstract class GuiApiMapper extends GuiApiMapperBase {

    @Mapping(target = "driverMemberId", source = "driver.memberId")
    @Mapping(target = "carId", source = "car.id")
    @Mapping(target = "carName", source = "car.name")
    @Mapping(target = "carKm", source = "car.km", conditionExpression = "java(carSharing.getCar().isKmConfirmed())")
    public abstract CarSharingReservation toApi(CarSharing carSharing);
    
    public abstract List<CarSharingReservation> toApi(List<CarSharing> carSharings);
    
}
