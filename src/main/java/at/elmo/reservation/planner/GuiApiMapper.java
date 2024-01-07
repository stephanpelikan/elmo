package at.elmo.reservation.planner;

import at.elmo.car.Car;
import at.elmo.gui.api.v1.PlannerCar;
import at.elmo.gui.api.v1.PlannerDriver;
import at.elmo.gui.api.v1.PlannerReservation;
import at.elmo.gui.api.v1.ReservationType;
import at.elmo.member.Member;
import at.elmo.reservation.ReservationBase;
import at.elmo.reservation.ReservationMapperBase;
import at.elmo.reservation.carsharing.CarSharing;
import at.elmo.reservation.passengerservice.shift.Shift;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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
        result.setType(toReservationType(reservation));

        if (result.getType() == ReservationType.CS) {
            
            final var carSharing = (CarSharing) reservation;
            result.setDriverMemberId(carSharing.getDriver().getMemberId());
            result.setStatus(carSharing.getStatus().name());
            
        } else if (result.getType() == ReservationType.PS) {
            
            final var shift = (Shift) reservation;
            result.setStatus(shift.getStatus().name());
            if (shift.getDriver() != null) {
                result.setDriverMemberId(shift.getDriver().getMemberId());
            }

            // until passenger-service is implemented all shifts
            // of the next week are assumed as "having rides"
            // starting on Friday of the week before
            final var now = LocalDateTime.now();
            final var beginOfNextWeek = now
                    .truncatedTo(ChronoUnit.DAYS)
                    .minusDays(now.getDayOfWeek().getValue() - 1)
                    .plusWeeks(1);
            final var endOfNextWeek = beginOfNextWeek
                    .plusWeeks(1);
            if ((now.getDayOfWeek() == DayOfWeek.THURSDAY)
                    && shift.getStartsAt().isAfter(beginOfNextWeek)
                    && shift.getStartsAt().isBefore(endOfNextWeek)) {
                result.setHasRides(true);
            } else {
                result.setHasRides(false);
            }

            if (shift.getDriverRequestingSwap() != null) {
                result.setSwapInProgressMemberId(shift.getDriverRequestingSwap().getMemberId());
            }

        }

        return result;

    }

}
