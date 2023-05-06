package at.elmo.reservation.passengerservice;

import at.elmo.gui.api.v1.ShiftReservation;
import at.elmo.reservation.ReservationMapperBase;
import at.elmo.reservation.passengerservice.shift.Shift;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(implementationName = "CarPassengerServiceGuiApiMapperImpl")
public abstract class GuiApiMapper extends ReservationMapperBase {

    @Mapping(target = "carKm", ignore = true)
    @Mapping(target = "carId", source = "car.id")
    @Mapping(target = "carName", source = "car.name")
    @Mapping(target = "driverMemberId", source = "driver.memberId")
    @Mapping(target = "userTaskId", ignore = true)
    @Mapping(target = "userTaskType", ignore = true)
    public abstract ShiftReservation toApi(Shift shift);
    
    public abstract List<ShiftReservation> toApi(List<Shift> shifts);
    
}
