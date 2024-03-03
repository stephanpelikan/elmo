package at.elmo.reservation.maintenance;

import at.elmo.car.CarService;
import at.elmo.gui.api.v1.AddPlannerReservation;
import at.elmo.gui.api.v1.MaintenanceApi;
import at.elmo.gui.api.v1.ResizeReservationRequest;
import at.elmo.member.Role;
import at.elmo.reservation.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("maintenanceGuiApi")
@RequestMapping("/api/v1")
@Secured({ Role.ROLE_MANAGER, Role.ROLE_ADMIN })
public class GuiApiController implements MaintenanceApi {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private CarService carService;

    @Autowired
    private MaintenanceService maintenanceService;

    @Override
    public ResponseEntity<Void> cancelMaintenanceReservation(
            final String carId,
            final String reservationId,
            final String comment) {

        if (!StringUtils.hasText(carId)) {
            return ResponseEntity.badRequest().build();
        }
        final var car = carService.getCar(carId);
        if (car.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        final boolean cancelled = maintenanceService.cancelMaintenance(carId, reservationId);
        if (!cancelled) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<Void> resizeMaintenanceReservation(
            final String carId,
            final String reservationId,
            final ResizeReservationRequest resizeReservationRequest) {

        final var success = maintenanceService.resizeMaintenance(
                carId,
                reservationId,
                resizeReservationRequest.getStartsAt(),
                resizeReservationRequest.getEndsAt());
        if (!success) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<Void> addMaintenanceReservation(
            final String carId,
            final AddPlannerReservation blockingReservation) {

        final var carFound = carService.getCar(carId);
        if (carFound.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        final var car = carFound.get();

        try {

            final var blocking = maintenanceService.createMaintenance(
                    car,
                    blockingReservation.getStartsAt(),
                    blockingReservation.getEndsAt(),
                    blockingReservation.getComment());

            // overlappings may happen by a small chance if a concurrent transaction is not committed
            final var overlappingsAfterwards = reservationService.checkForOverlappings(
                    car,
                    blockingReservation.getStartsAt(),
                    blockingReservation.getEndsAt());
            if (overlappingsAfterwards.size() > 1) { // 1 ... the new created car-sharing session
                maintenanceService
                        .cancelMaintenance(car.getId(), blocking.getId());
            }

        } catch (UnsupportedOperationException e) {

            return ResponseEntity.status(HttpStatus.CONFLICT).build();

        }

        return ResponseEntity.ok().build();

    }

}
