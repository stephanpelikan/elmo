package at.elmo.reservation.planner;

import at.elmo.car.Car;
import at.elmo.gui.api.v1.PlannerCar;
import at.elmo.gui.api.v1.PlannerDriver;
import at.elmo.gui.api.v1.PlannerReservation;
import at.elmo.gui.api.v1.PlannerReservationType;
import at.elmo.member.Member;
import at.elmo.reservation.ReservationBase;
import at.elmo.reservation.ReservationMapperBase;
import at.elmo.reservation.blocking.BlockingReservation;
import at.elmo.reservation.carsharing.CarSharing;
import at.elmo.reservation.passangerservice.shift.Shift;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collection;
import java.util.List;

@Mapper
public abstract class GuiApiMapper extends ReservationMapperBase {

    @Mapping(target = "reservations", ignore = true)
    public abstract PlannerCar toApi(Car car);

    public abstract List<PlannerCar> toApi(List<Car> car);

    @Mapping(target = "avatar", source = "timestampOfAvatar")
    public abstract PlannerDriver toApi(Member car);

    public abstract List<PlannerDriver> toApi(Collection<Member> car);

    public PlannerReservation toApi(ReservationBase reservation) {

        if (reservation == null) {
            return null;
        }
        final var result = new PlannerReservation();
        result.setId(reservation.getId());
        result.setStartsAt(reservation.getStartsAt());
        result.setEndsAt(reservation.getEndsAt());
        result.setType(toPlannerReservationType(reservation));
        if (result.getType() == PlannerReservationType.CS) {
            final var Planner = (CarSharing) reservation;
            result.setDriverMemberId(Planner.getDriver().getMemberId());
            result.setStatus(Planner.getStatus().name());
        } else if (result.getType() == PlannerReservationType.PS) {
            final var shift = (Shift) reservation;
            if (shift.getDriver() != null) {
                result.setDriverMemberId(shift.getDriver().getMemberId());
            }
        }
        return result;

    }

    public PlannerReservationType toPlannerReservationType(final ReservationBase reservation) {

        if (reservation == null) {
            return null;
        }
        if (reservation instanceof CarSharing) {
            return PlannerReservationType.CS;
        }
        if (reservation instanceof BlockingReservation) {
            return PlannerReservationType.BLOCK;
        }
        if (reservation instanceof Shift) {
            return PlannerReservationType.PS;
        }
        throw new RuntimeException(
                "Unknown reservation type '"
                + reservation.toString()
                + "'! Did you forget to extend this mapping-method?");

    }

}
