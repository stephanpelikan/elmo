package at.elmo.reservation.blocking;

import at.elmo.car.Car;
import at.elmo.reservation.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BlockingService {

    @Autowired
    private BlockingRepository blockings;

    @Autowired
    private ReservationService reservationService;

    public void createBlocking(
            final Car car,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt) throws Exception {

        createBlocking(car, startsAt, endsAt, null);

    }

    public void createBlocking(
            final Car car,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt,
            final String reason) throws Exception {

        final var overlappings = reservationService
                .checkForOverlappings(car, startsAt, endsAt);
        if (!overlappings.isEmpty()) {
            throw new Exception(
                    "Cannot create blocking at "
                    + startsAt
                    + " -> "
                    + endsAt
                    + " due to existing overlapping reservations: "
                    + overlappings.stream().collect(Collectors.joining(", ")));
        }

        final var blocking = new BlockingReservation();
        blocking.setId(UUID.randomUUID().toString());
        blocking.setCar(car);
        blocking.setStartsAt(startsAt);
        blocking.setEndsAt(endsAt);
        blocking.setReason(reason);

        blockings.save(blocking);

    }

}
