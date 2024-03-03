package at.elmo.reservation.maintenance;

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
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository maintenances;

    @Autowired
    private ReservationService reservationService;

    public void createMaintenance(
            final Car car,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt) throws Exception {

        createMaintenance(car, startsAt, endsAt, null);

    }

    public MaintenanceReservation createMaintenance(
            final Car car,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt,
            final String reason) throws UnsupportedOperationException {

        final var overlappings = reservationService
                .checkForOverlappings(car, startsAt, endsAt);
        if (!overlappings.isEmpty()) {
            throw new UnsupportedOperationException(
                    "Cannot create maintenance at "
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

        final var newMaintenance = new MaintenanceReservation();
        newMaintenance.setId(UUID.randomUUID().toString());
        newMaintenance.setCar(car);
        newMaintenance.setStartsAt(startsAt);
        newMaintenance.setEndsAt(endsAt);
        newMaintenance.setReason(reason);
        newMaintenance.setPreviousReservation(previousReservation);
        newMaintenance.setNextReservation(nextReservation);

        final var maintenance = maintenances.save(newMaintenance);

        if (nextReservation != null) {
            nextReservation.setPreviousReservation(maintenance);
        }
        if (previousReservation != null) {
            previousReservation.setNextReservation(maintenance);
        }

        return maintenance;

    }

    public boolean cancelMaintenance(
            final String carId,
            final String reservationId) {

        final var maintenanceFound = maintenances.findById(reservationId);
        if (maintenanceFound.isEmpty()) {
            return false;
        }
        final var maintenance = maintenanceFound.get();

        final var car = maintenance.getCar();
        if (!car.getId().equals(carId)) {
            return false;
        }

        final var now = LocalDateTime.now();

        final ReservationBase previousReservation;
        final ReservationBase nextReservation;

        // maintenance already started
        if (maintenance.getStartsAt().isBefore(now)) {

            final var endOfUsage = now
                    .truncatedTo(ChronoUnit.HOURS);
            if (endOfUsage.isBefore(maintenance.getEndsAt())) {
                maintenance.setEndsAt(endOfUsage);
                previousReservation = null;
            } else {
                previousReservation = maintenance.getPreviousReservation();
            }

            nextReservation = maintenance.getNextReservation();
            if (maintenance.getNextReservation() != null) {
                maintenance.getNextReservation().setPreviousReservation(null);
                maintenance.setNextReservation(null);
            }

        } else {

            previousReservation = maintenance.getPreviousReservation();
            if (maintenance.getPreviousReservation() != null) {
                maintenance.getPreviousReservation().setNextReservation(null);
            }

            nextReservation = maintenance.getNextReservation();
            if (maintenance.getNextReservation() != null) {
                maintenance.getNextReservation().setPreviousReservation(null);
            }

            maintenances.save(maintenance);
            maintenances.delete(maintenance);

        }

        return true;

    }

    public boolean resizeMaintenance(
            final String carId,
            final String reservationId,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt) {

        final var maintenanceFound = maintenances.findById(reservationId);
        if (maintenanceFound.isEmpty()) {
            return false;
        }
        final var maintenance = maintenanceFound.get();

        final var car = maintenance.getCar();
        if (!car.getId().equals(carId)) {
            return false;
        }

        if (maintenance.getStartsAt().equals(startsAt)
                && maintenance.getEndsAt().equals(endsAt)) {
            return true;
        }

        final var now = LocalDateTime.now();

        if (maintenance.getStartsAt().isAfter(now)) {
            // maintenance not yet started
            maintenance.setStartsAt(startsAt);
        }
        maintenance.setEndsAt(endsAt);

        if (maintenance.getPreviousReservation() != null) {
            maintenance.getPreviousReservation().setNextReservation(null);
            maintenance.setPreviousReservation(null);
        }
        if (maintenance.getNextReservation() != null) {
            maintenance.getNextReservation().setPreviousReservation(null);
            maintenance.setNextReservation(null);
        }

        final var nextReservation = reservationService
                .getReservationByStartsAt(car, endsAt);
        final var previousReservation = reservationService
                .getReservationByEndsAt(car, startsAt);
        maintenance.setNextReservation(nextReservation);
        maintenance.setPreviousReservation(previousReservation);

        return true;

    }

}
