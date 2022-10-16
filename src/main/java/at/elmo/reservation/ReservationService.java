package at.elmo.reservation;

import at.elmo.car.Car;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservations;

    public List<String> checkForOverlappings(
            final Car car,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt) {

        return reservations.findOverlappingReservationsIds(
                startsAt,
                endsAt,
                car);

    }

    public List<ReservationBase> findReservations(
            final LocalDateTime startsAt,
            final LocalDateTime endsAt) {

        return reservations.findInPeriod(
                startsAt,
                endsAt,
                Sort.by(Direction.ASC, "startsAt"));

    }

}
