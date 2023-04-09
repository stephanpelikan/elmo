package at.elmo.reservation.passengerservice;

import at.elmo.gui.api.v1.ShiftOverviewDay;
import at.elmo.gui.api.v1.ShiftOverviewHour;
import at.elmo.gui.api.v1.ShiftOverviewWeek;
import at.elmo.reservation.ReservationMapperBase;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(implementationName = "CarPassengerServiceGuiApiMapperImpl")
public abstract class GuiApiMapper extends ReservationMapperBase {

    public abstract List<ShiftOverviewWeek> toApi(
            List<at.elmo.reservation.passengerservice.shift.overview.ShiftOverviewWeek> week);

    public abstract ShiftOverviewWeek toApi(
            at.elmo.reservation.passengerservice.shift.overview.ShiftOverviewWeek week);
    
    public abstract ShiftOverviewDay toApi(
            at.elmo.reservation.passengerservice.shift.overview.ShiftOverviewDay day);
    
    public abstract ShiftOverviewHour toApi(
            at.elmo.reservation.passengerservice.shift.overview.ShiftOverviewHour hour);
    
}
