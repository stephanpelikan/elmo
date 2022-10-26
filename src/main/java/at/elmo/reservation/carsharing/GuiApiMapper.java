package at.elmo.reservation.carsharing;

import at.elmo.car.Car;
import at.elmo.gui.api.v1.CarSharingCar;
import at.elmo.gui.api.v1.CarSharingDriver;
import at.elmo.gui.api.v1.CarSharingReservation;
import at.elmo.gui.api.v1.CarSharingReservationType;
import at.elmo.member.Member;
import at.elmo.reservation.ReservationBase;
import at.elmo.reservation.ReservationMapperBase;
import at.elmo.reservation.blocking.BlockingReservation;
import at.elmo.reservation.passangerservice.shift.Shift;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collection;
import java.util.List;

@Mapper
public abstract class GuiApiMapper extends ReservationMapperBase {

    @Mapping(target = "reservations", ignore = true)
    public abstract CarSharingCar toApi(Car car);

    public abstract List<CarSharingCar> toApi(List<Car> car);

    @Mapping(target = "avatar", source = "timestampOfAvatar")
    public abstract CarSharingDriver toApi(Member car);

    public abstract List<CarSharingDriver> toApi(Collection<Member> car);

    public CarSharingReservation toApi(ReservationBase reservation) {

        if (reservation == null) {
            return null;
        }
        final var result = new CarSharingReservation();
        result.setId(reservation.getId());
        result.setStartsAt(reservation.getStartsAt());
        result.setEndsAt(reservation.getEndsAt());
        result.setType(toCarSharingReservationType(reservation));
        if (result.getType() == CarSharingReservationType.CS) {
            result.setDriverMemberId(((CarSharing) reservation).getDriver().getMemberId());
        }
        return result;

    }

    public CarSharingReservationType toCarSharingReservationType(final ReservationBase reservation) {

        if (reservation == null) {
            return null;
        }
        if (reservation instanceof CarSharing) {
            return CarSharingReservationType.CS;
        }
        if (reservation instanceof BlockingReservation) {
            return CarSharingReservationType.BLOCK;
        }
        if (reservation instanceof Shift) {
            return CarSharingReservationType.PS;
        }
        throw new RuntimeException(
                "Unknown reservation type '"
                + reservation.toString()
                + "'! Did you forget to extend this mapping-method?");

    }

}
