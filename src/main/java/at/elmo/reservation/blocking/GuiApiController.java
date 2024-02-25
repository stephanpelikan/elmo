package at.elmo.reservation.blocking;

import at.elmo.car.CarService;
import at.elmo.gui.api.v1.AddPlannerReservation;
import at.elmo.gui.api.v1.BlockingApi;
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

@RestController("blockingGuiApi")
@RequestMapping("/api/v1")
@Secured({ Role.ROLE_MANAGER, Role.ROLE_ADMIN })
public class GuiApiController implements BlockingApi {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private CarService carService;

    @Autowired
    private BlockingService blockingService;

    @Override
    public ResponseEntity<Void> cancelBlockingReservation(
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

        final boolean cancelled = blockingService.cancelBlocking(carId, reservationId);
        if (!cancelled) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<Void> resizeBlockingReservation(
            final String carId,
            final String reservationId,
            final ResizeReservationRequest resizeReservationRequest) {

        final var success = blockingService.resizeBlocking(
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
    public ResponseEntity<Void> addBlockingReservation(
            final String carId,
            final AddPlannerReservation blockingReservation) {

        final var carFound = carService.getCar(carId);
        if (carFound.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        final var car = carFound.get();

        try {

            final var blocking = blockingService.createBlocking(
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
                blockingService
                        .cancelBlocking(car.getId(), blocking.getId());
            }

        } catch (UnsupportedOperationException e) {

            return ResponseEntity.status(HttpStatus.CONFLICT).build();

        }

        return ResponseEntity.ok().build();

    }

}
