package at.elmo.reservation;

import at.elmo.gui.api.v1.GetDriverActivitiesOfYear200ResponseInner;
import at.elmo.gui.api.v1.ReservationType;
import at.elmo.reservation.carsharing.CarSharing;
import at.elmo.reservation.passengerservice.shift.Shift;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(implementationName = "ReservationGuiApiMapperImpl")
public abstract class GuiApiMapper extends ReservationMapperBase {

    public GetDriverActivitiesOfYear200ResponseInner toApi(
            final ReservationBase reservation) {
        
        if (reservation == null) {
            return null;
        }

        final var result = new GetDriverActivitiesOfYear200ResponseInner();
        result.setId(reservation.getId());
        result.setStartsAt(reservation.getStartsAt());
        result.setEndsAt(reservation.getEndsAt());
        result.setType(toReservationType(reservation));
        result.setCarId(reservation.getCar().getId());
        result.setCarName(reservation.getCar().getName());
        
        if (result.getType() == ReservationType.CS) {

            final var carSharing = (CarSharing) reservation;
            result.setDriverMemberId(carSharing.getDriver().getMemberId());
            result.setCreatedAt(carSharing.getCreatedAt());
            result.setKmAtStart(carSharing.getKmAtStart());
            result.setKmAtEnd(carSharing.getKmAtEnd());
            result.setCarStatusComment(carSharing.getCarStatusComment());
            result.setStartUsage(carSharing.getStartUsage());
            result.setEndUsage(carSharing.getEndUsage());
            result.setHoursPlanned(carSharing.getHoursPlanned());
            result.setUsageMinutes(carSharing.getUsageMinutes());
            
        } else if (result.getType() == ReservationType.PS) {
            
            final var shift = (Shift) reservation;
            result.setDriverMemberId(shift.getDriver().getMemberId());
            result.setKmAtStart(shift.getKmAtStart());
            result.setKmAtEnd(shift.getKmAtEnd());
            result.setStartUsage(shift.getStartUsage());
            result.setEndUsage(shift.getEndUsage());
            result.setUsageMinutes(shift.getUsageMinutes());

        }
        
        return result;
        
    }
    
    public abstract List<GetDriverActivitiesOfYear200ResponseInner> toApi(List<ReservationBase> reservations);
    
}
