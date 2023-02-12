package at.elmo.reservation.carsharing;

import at.elmo.car.CarService;
import at.elmo.gui.api.v1.AddPlannerReservation;
import at.elmo.gui.api.v1.CarSharingApi;
import at.elmo.gui.api.v1.CarSharingReservation;
import at.elmo.gui.api.v1.CarSharingReservations;
import at.elmo.gui.api.v1.CarSharingStarStopRequest;
import at.elmo.gui.api.v1.ExtendCarSharingRequest;
import at.elmo.gui.api.v1.PlannerReservationType;
import at.elmo.reservation.ReservationService;
import at.elmo.reservation.passangerservice.shift.Shift;
import at.elmo.util.UserContext;
import at.elmo.util.exceptions.ElmoException;
import at.elmo.util.exceptions.ElmoValidationException;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController("carSharingGuiApi")
@RequestMapping("/api/v1")
@Secured("DRIVER")
public class GuiApiController implements CarSharingApi {
    
    @Autowired
    private Logger logger;

    @Autowired
    private GuiApiMapper mapper;
    
    @Autowired
    private ReservationService reservationService;

    @Autowired
    private CarService carService;

    @Autowired
    private CarSharingService carSharingService;

    @Autowired
    private CarSharingProperties properties;
    
    @Autowired
    private UserContext userContext;

    @Override
    public ResponseEntity<Void> cancelCarSharingReservation(
            final String carId,
            final String reservationId) {
        
        if (!StringUtils.hasText(carId)) {
            return ResponseEntity.badRequest().build();
        }
        final var car = carService.getCar(carId);
        if (car.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        final var cancelled = carSharingService
                .cancelCarSharingByDriver(reservationId);
        if (!cancelled) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok().build();
        
    }

    @Override
    public ResponseEntity<Void> addCarSharingReservation(
            final String carId,
            final AddPlannerReservation carSharingReservation) {

        if ((carSharingReservation == null)
                || (carSharingReservation.getType() != PlannerReservationType.CS)) {
            return ResponseEntity.badRequest().build();
        }

        if (!StringUtils.hasText(carId)) {
            return ResponseEntity.badRequest().build();
        }
        final var car = carService.getCar(carId);
        if (car.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        final var driver = userContext.getLoggedInMember();
        if ((carSharingReservation.getDriverMemberId() == null)
                || !driver.getMemberId().equals(carSharingReservation.getDriverMemberId())) {
            return ResponseEntity.badRequest().build();
        }

        if ((carSharingReservation.getStartsAt() == null)
                || (carSharingReservation.getEndsAt() == null)) {
            return ResponseEntity.badRequest().build();
        }
        
        final var hours = Duration
                .between(
                        carSharingReservation.getStartsAt(),
                        carSharingReservation.getEndsAt())
                .toHours();
        final var newHoursConsumedCarSharing =
                driver.getHoursConsumedCarSharing()
                + hours;
        if ((newHoursConsumedCarSharing > driver.getHoursServedPassangerService())
                && !properties.isAllowPaidCarSharing()) {
            return ResponseEntity.badRequest().build();
        }

        if (carSharingService.numberOfFutureCarSharings(driver) >=
                properties.getMaxReservations()) {
            throw new ElmoValidationException(
                    "max-reservations",
                    Long.toString(properties.getMaxReservations()));
        }
        
        final var overlappings = reservationService.checkForOverlappings(
                car.get(),
                carSharingReservation.getStartsAt(),
                carSharingReservation.getEndsAt());
        if (!overlappings.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        
        reservationService.findReservations(
                carSharingReservation.getStartsAt(),
                carSharingReservation.getEndsAt())
                .stream()
                .forEach(reservation -> {
                    if ((reservation instanceof CarSharing)
                            && ((CarSharing) reservation).getDriver().getId()
                                    .equals(driver.getId())) {
                        throw new ElmoValidationException(
                                "parallel-carsharing",
                                reservation.getCar().getName());
                    } else if ((reservation instanceof Shift)
                            && (((Shift) reservation).getDriver() != null)
                            && ((Shift) reservation).getDriver().getId()
                            .equals(driver.getId())) {
                        throw new ElmoValidationException(
                                "parallel-passangerservice",
                                reservation.getCar().getName());
                    }
                });
        
        try {
            
            final var carSharing = carSharingService.createCarSharing(
                    car.get(),
                    carSharingReservation.getStartsAt(),
                    carSharingReservation.getEndsAt(),
                    driver);
            
            // overlappings may happen by a small chance if a concurrent transaction is not committed
            final var overlappingsAfterwards = reservationService.checkForOverlappings(
                    car.get(),
                    carSharingReservation.getStartsAt(),
                    carSharingReservation.getEndsAt());
            if (overlappingsAfterwards.size() > 1) { // 1 ... the new created car-sharing session
                carSharingService
                        .cancelCarSharingDueToConflict(carSharing);
            }
            
        } catch (Exception e) {
            logger.error("Could not add car-sharing", e);
            return ResponseEntity.internalServerError().build();
        }

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<CarSharingReservations> getCarSharingReservations() {
        
        final var driver = userContext.getLoggedInMember();
        
        final var carSharings = carSharingService.getOutstandingReservations(driver);
        
        final var result = new CarSharingReservations()
                .reservations(mapper.toApi(carSharings));
        
        return ResponseEntity.ok(result);
        
    }
    
    @Override
    public ResponseEntity<CarSharingReservation> extendCarSharing(
            final String carId,
            final String reservationId,
            final ExtendCarSharingRequest details) {
        
        if (details == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!StringUtils.hasText(details.getUserTaskId())) {
            return ResponseEntity.badRequest().build();
        }

        if (!StringUtils.hasText(carId)) {
            return ResponseEntity.badRequest().build();
        }
        final var carFound = carService.getCar(carId);
        if (carFound.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            
            final var reservation = carSharingService.extendCarSharing(
                    carId,
                    reservationId,
                    details.getUserTaskId(),
                    details.getTimestamp());

            if (reservation == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(mapper.toApi(reservation));
            
        } catch (ElmoException e) {
            throw new ElmoValidationException("timestamp", e.getMessage());
        }
        
    }
    
    @Override
    public ResponseEntity<CarSharingReservation> confirmStartOrStopOfCarSharing(
            final String carId,
            final String reservationId,
            final CarSharingStarStopRequest body) {
        
        if (body == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!StringUtils.hasText(body.getUserTaskId())) {
            return ResponseEntity.badRequest().build();
        }
        if (body.getKm() == null) {
            throw new ElmoValidationException("km", "missing");
        }

        if (!StringUtils.hasText(carId)) {
            return ResponseEntity.badRequest().build();
        }
        final var carFound = carService.getCar(carId);
        if (carFound.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        final var car = carFound.get();

        if (body.getKm() < car.getKm()) {
            throw new ElmoValidationException("km", "lower-than-car");
        }
        
        final var reservation = carSharingService.startOrStopCarSharing(
                carId,
                reservationId,
                body.getUserTaskId(),
                body.getTimestamp(),
                body.getKm(),
                body.getComment());
        
        if (reservation == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(mapper.toApi(reservation));
        
    }
    
}
