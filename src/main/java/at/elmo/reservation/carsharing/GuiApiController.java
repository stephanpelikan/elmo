package at.elmo.reservation.carsharing;

import at.elmo.car.CarService;
import at.elmo.gui.api.v1.AddPlannerReservation;
import at.elmo.gui.api.v1.CarSharingApi;
import at.elmo.gui.api.v1.CarSharingReservation;
import at.elmo.gui.api.v1.CarSharingStartRequest;
import at.elmo.gui.api.v1.CarSharingStopRequest;
import at.elmo.gui.api.v1.ExtendCarSharingRequest;
import at.elmo.gui.api.v1.ReservationType;
import at.elmo.gui.api.v1.ResizeCarSharingRequest;
import at.elmo.member.Role;
import at.elmo.reservation.DriverBasedReservation;
import at.elmo.reservation.ReservationService;
import at.elmo.reservation.passengerservice.shift.Shift;
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
import java.util.HashMap;
import java.util.List;

@RestController("carSharingGuiApi")
@RequestMapping("/api/v1")
@Secured({ Role.ROLE_DRIVER, Role.ROLE_MANAGER, Role.ROLE_ADMIN })
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
            final String reservationId,
            final String comment) {
        
        if (!StringUtils.hasText(carId)) {
            return ResponseEntity.badRequest().build();
        }
        final var car = carService.getCar(carId);
        if (car.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // see https://github.com/OpenAPITools/openapi-generator/issues/13456
        final String fixedComment;
        if (comment == null) {
            fixedComment = null;
        } else {
            if (comment.startsWith("\"")
                    && comment.endsWith("\"")
                    && (comment.length() > 2)) {
                fixedComment = comment.substring(1, comment.length() - 1);
            } else {
                fixedComment = comment;
            }
        }
                
        final var cancelled = carSharingService
                .cancelCarSharingByUser(
                        reservationId,
                        userContext.getLoggedInMember(),
                        fixedComment);
        if (!cancelled) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok().build();
        
    }

    @Override
    public ResponseEntity<Void> resizeCarSharingReservation(
            final String carId,
            final String reservationId,
            final ResizeCarSharingRequest resizeCarSharingRequest) {

        if ((resizeCarSharingRequest == null)
                || (resizeCarSharingRequest.getStartsAt() == null)
                || (resizeCarSharingRequest.getEndsAt() == null)) {
            return ResponseEntity.badRequest().build();
        }
        if (!StringUtils.hasText(carId)) {
            return ResponseEntity.badRequest().build();
        }

        final var carSharingFound = reservationService.getReservation(reservationId);
        if (carSharingFound == null) {
            return ResponseEntity.notFound().build();
        }
        if (!(carSharingFound instanceof CarSharing carSharing)) {
            return ResponseEntity.badRequest().build();
        }

        if (!carSharing.getCar().getId().equals(carId)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            reservationService.findReservations(
                            resizeCarSharingRequest.getStartsAt(),
                            resizeCarSharingRequest.getEndsAt())
                    .stream()
                    .filter(reservation -> !reservation.getId().equals(reservationId))
                    .peek(reservation -> {
                        if (reservation.getCar().getId().equals(carSharing.getId())) {
                            throw new ElmoException();
                        }
                    })
                    .filter(reservation -> reservation instanceof DriverBasedReservation)
                    .map(reservation -> (DriverBasedReservation) reservation)
                    .filter(reservation -> reservation.getDriver() != null
                            && reservation.getDriver().getId().equals(carSharing.getDriver().getId()))
                    .forEach(reservation -> {
                        logger.info("test: {}", reservation.getId());
                        if (reservation instanceof CarSharing) {
                            throw new ElmoValidationException(
                                    "parallel-carsharing",
                                    reservation.getCar().getName());
                        } else if (reservation instanceof Shift) {
                            throw new ElmoValidationException(
                                    "parallel-passengerservice",
                                    reservation.getCar().getName());
                        }
                    });
        } catch (ElmoValidationException e) {
            throw e;
        } catch (ElmoException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        try {

            final var carSharingUpdated = carSharingService.resizeCarSharing(
                    carId,
                    reservationId,
                    userContext.getLoggedInMember(),
                    resizeCarSharingRequest.getStartsAt(),
                    resizeCarSharingRequest.getEndsAt(),
                    resizeCarSharingRequest.getComment());

            if (carSharingUpdated == null) {
                return ResponseEntity.badRequest().build();
            }

            // overlappings may happen by a small chance if a concurrent transaction is not committed
            final var overlappingsAfterwards = reservationService.checkForOverlappings(
                    carSharing.getCar(),
                    resizeCarSharingRequest.getStartsAt(),
                    resizeCarSharingRequest.getEndsAt());
            if (overlappingsAfterwards.size() > 1) { // 1 ... the changed car-sharing session
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

        } catch (Exception e) {
            logger.error("Could not resize car-sharing", e);
            return ResponseEntity.internalServerError().build();
        }

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<Void> addCarSharingReservation(
            final String carId,
            final AddPlannerReservation carSharingReservation) {

        if ((carSharingReservation == null)
                || (carSharingReservation.getType() != ReservationType.CS)) {
            return ResponseEntity.badRequest().build();
        }
        if ((carSharingReservation.getStartsAt() == null)
                || (carSharingReservation.getEndsAt() == null)) {
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

        final var hours = Duration
                .between(
                        carSharingReservation.getStartsAt(),
                        carSharingReservation.getEndsAt())
                .toHours();
        final var newHoursConsumedCarSharing =
                driver.getHoursConsumedCarSharing()
                + hours;
        if ((newHoursConsumedCarSharing > driver.getHoursServedPassengerService())
                && !properties.isAllowPaidCarSharing()) {
            return ResponseEntity.badRequest().build();
        }

        if (carSharingService.numberOfFutureCarSharings(driver) >=
                properties.getMaxReservations()) {
            throw new ElmoValidationException(
                    "max-reservations",
                    Long.toString(properties.getMaxReservations()));
        }

        try {
            reservationService.findReservations(
                            carSharingReservation.getStartsAt(),
                            carSharingReservation.getEndsAt())
                    .stream()
                    .peek(reservation -> {
                        if (reservation.getCar().getId().equals(carId)) {
                            throw new ElmoException();
                        }
                    })
                    .filter(reservation -> reservation instanceof DriverBasedReservation)
                    .map(reservation -> (DriverBasedReservation) reservation)
                    .filter(reservation -> reservation.getDriver() != null
                            && reservation.getDriver().getId().equals(driver.getId()))
                    .forEach(reservation -> {
                        if (reservation instanceof CarSharing) {
                            throw new ElmoValidationException(
                                    "parallel-carsharing",
                                    reservation.getCar().getName());
                        } else if (reservation instanceof Shift) {
                            throw new ElmoValidationException(
                                    "parallel-passengerservice",
                                    reservation.getCar().getName());
                        }
                    });
        } catch (ElmoValidationException e) {
            throw e;
        } catch (ElmoException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

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
    public ResponseEntity<List<CarSharingReservation>> getCarSharingReservations() {
        
        final var driver = userContext.getLoggedInMember();
        
        final var carSharings = carSharingService.getOutstandingReservations(driver);
        
        final var result = mapper.toApi(carSharings);
        
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
    public ResponseEntity<CarSharingReservation> confirmBeginOfCarSharing(
            final String carId,
            final String reservationId,
            final CarSharingStartRequest body) {
        
        if (body == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!StringUtils.hasText(body.getUserTaskId())) {
            return ResponseEntity.badRequest().build();
        }
        if (body.getKmStart() == null) {
            throw new ElmoValidationException("kmStart", "missing");
        }

        if (!StringUtils.hasText(carId)) {
            return ResponseEntity.badRequest().build();
        }
        final var carFound = carService.getCar(carId);
        if (carFound.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        final var car = carFound.get();

        if (body.getKmStart() < car.getKm()) {
            throw new ElmoValidationException("kmStart", "lower-than-car");
        }
        
        final var reservation = carSharingService.startOrStopCarSharing(
                carId,
                reservationId,
                body.getUserTaskId(),
                body.getTimestamp(),
                body.getKmStart(),
                null,
                body.getCarStatusComment());
        
        if (reservation == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(mapper.toApi(reservation));
        
    }
    
    @Override
    public ResponseEntity<CarSharingReservation> confirmEndOfCarSharing(
            final String carId,
            final String reservationId,
            final CarSharingStopRequest body) {
        
        if (body == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!StringUtils.hasText(body.getUserTaskId())) {
            return ResponseEntity.badRequest().build();
        }

        if (!StringUtils.hasText(carId)) {
            return ResponseEntity.badRequest().build();
        }
        final var carFound = carService.getCar(carId);
        if (carFound.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        final var car = carFound.get();

        final var violations = new HashMap<String, String>();
        if (body.getKmEnd() == null) {
            violations.put("kmEnd", "missing");
        } else {
            if (body.getKmEnd() < car.getKm()) {
                violations.put("kmEnd", "lower-than-car");
            }
            if (body.getKmStart() != null) {
                if (body.getKmStart() < car.getKm()) {
                    violations.put("kmStart", "lower-than-car");
                }
                if (body.getKmStart() > body.getKmEnd()) {
                    violations.put("kmStart", "higher-than-end");
                }
            }
        }
        
        if (!violations.isEmpty()) {
            throw new ElmoValidationException(violations);
        }
        
        final var reservation = carSharingService.startOrStopCarSharing(
                carId,
                reservationId,
                body.getUserTaskId(),
                body.getTimestamp(),
                body.getKmStart(),
                body.getKmEnd(),
                body.getCarStatusComment());
        
        if (reservation == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(mapper.toApi(reservation));
        
    }

}
