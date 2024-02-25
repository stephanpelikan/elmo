package at.elmo.reservation.blocking;

import at.elmo.car.Car;
import at.elmo.reservation.ReservationBase;
import at.elmo.reservation.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@Transactional
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

    public BlockingReservation createBlocking(
            final Car car,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt,
            final String reason) throws UnsupportedOperationException {

        final var overlappings = reservationService
                .checkForOverlappings(car, startsAt, endsAt);
        if (!overlappings.isEmpty()) {
            throw new UnsupportedOperationException(
                    "Cannot create blocking at "
                    + startsAt
                    + " -> "
                    + endsAt
                    + " due to existing overlapping reservations: "
                    + String.join(", ", overlappings));
        }

        final var nextReservation = reservationService
                .getReservationByStartsAt(car, endsAt);
        final var previousReservation = reservationService
                .getReservationByEndsAt(car, startsAt);
        
        final var newBlocking = new BlockingReservation();
        newBlocking.setId(UUID.randomUUID().toString());
        newBlocking.setCar(car);
        newBlocking.setStartsAt(startsAt);
        newBlocking.setEndsAt(endsAt);
        newBlocking.setReason(reason);
        newBlocking.setPreviousReservation(previousReservation);
        newBlocking.setNextReservation(nextReservation);

        final var blocking = blockings.save(newBlocking);
        
        if (nextReservation != null) {
            nextReservation.setPreviousReservation(blocking);
        }
        if (previousReservation != null) {
            previousReservation.setNextReservation(blocking);
        }

        return blocking;

    }

    public boolean cancelBlocking(
            final String carId,
            final String reservationId) {

        final var blockingFound = blockings.findById(reservationId);
        if (blockingFound.isEmpty()) {
            return false;
        }
        final var blocking = blockingFound.get();
        
        final var car = blocking.getCar();
        if (!car.getId().equals(carId)) {
            return false;
        }

        final var now = LocalDateTime.now();

        final ReservationBase previousReservation;
        final ReservationBase nextReservation;

        // blocking already started
        if (blocking.getStartsAt().isBefore(now)) {

            final var endOfUsage = now
                    .truncatedTo(ChronoUnit.HOURS);
            if (endOfUsage.isBefore(blocking.getEndsAt())) {
                blocking.setEndsAt(endOfUsage);
                previousReservation = null;
            } else {
                previousReservation = blocking.getPreviousReservation();
            }

            nextReservation = blocking.getNextReservation();
            if (blocking.getNextReservation() != null) {
                blocking.getNextReservation().setPreviousReservation(null);
                blocking.setNextReservation(null);
            }

        } else {

            previousReservation = blocking.getPreviousReservation();
            if (blocking.getPreviousReservation() != null) {
                blocking.getPreviousReservation().setNextReservation(null);
            }

            nextReservation = blocking.getNextReservation();
            if (blocking.getNextReservation() != null) {
                blocking.getNextReservation().setPreviousReservation(null);
            }

            blockings.save(blocking);
            blockings.delete(blocking);

        }

        if (nextReservation != null) {
            final var newPreviousReservation = reservationService
                    .getReservationByEndsAt(car, nextReservation.getStartsAt());
            newPreviousReservation.setPreviousReservation(newPreviousReservation);
        }
        if (previousReservation != null) {
            final var newNextReservation = reservationService
                    .getReservationByStartsAt(car, previousReservation.getEndsAt());
            newNextReservation.setNextReservation(newNextReservation);
        }

        return true;
            
    }

    public boolean resizeBlocking(
            final String carId,
            final String reservationId,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt) {

        final var blockingFound = blockings.findById(reservationId);
        if (blockingFound.isEmpty()) {
            return false;
        }
        final var blocking = blockingFound.get();

        final var car = blocking.getCar();
        if (!car.getId().equals(carId)) {
            return false;
        }
        
        if (blocking.getStartsAt().equals(startsAt)
                && blocking.getEndsAt().equals(endsAt)) {
            return true;
        }

        final var now = LocalDateTime.now();

        if (blocking.getStartsAt().isAfter(now)) {
            // blocking not yet started
            blocking.setStartsAt(startsAt);
        }
        blocking.setEndsAt(endsAt);

        if (blocking.getPreviousReservation() != null) {
            blocking.getPreviousReservation().setNextReservation(null);
            blocking.setPreviousReservation(null);
        }
        if (blocking.getNextReservation() != null) {
            blocking.getNextReservation().setPreviousReservation(null);
            blocking.setNextReservation(null);
        }

        final var nextReservation = reservationService
                .getReservationByStartsAt(car, endsAt);
        final var previousReservation = reservationService
                .getReservationByEndsAt(car, startsAt);
        blocking.setNextReservation(nextReservation);
        blocking.setPreviousReservation(previousReservation);

        return true;

    }

}
