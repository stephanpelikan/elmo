package at.elmo.reservation.carsharing;

import at.elmo.car.Car;
import at.elmo.car.CarService;
import at.elmo.gui.api.v1.CarSharingApi;
import at.elmo.gui.api.v1.CarSharingCalendar;
import at.elmo.gui.api.v1.CarSharingCalendarRequest;
import at.elmo.gui.api.v1.CarSharingReservation;
import at.elmo.gui.api.v1.CarSharingReservationType;
import at.elmo.reservation.ReservationService;
import at.elmo.util.UserContext;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController("carSharingGuiApi")
@RequestMapping("/api/v1")
@Secured("DRIVER")
public class GuiApiController implements CarSharingApi {

    @Autowired
    private Logger logger;
    
    @Autowired
    private ReservationService reservationService;

    @Autowired
    private GuiApiMapper mapper;

    @Autowired
    private CarService carService;

    @Autowired
    private CarSharingService carSharingService;

    @Autowired
    private UserContext userContext;

    @Override
    public ResponseEntity<CarSharingCalendar> getCarSharingCalendar(
            final CarSharingCalendarRequest request) {

        if ((request == null)
                || (request.getStartsAt() == null)
                || (request.getEndsAt() == null)) {
            return ResponseEntity.badRequest().build();
        }

        final var reservationsInPeriod = reservationService.findReservations(
                request.getStartsAt(),
                request.getEndsAt(),
                request.getHistory() == null ? false : request.getHistory());

        final var carReservations = carService
                .getCarSharingCars()
                .stream()
                .collect(Collectors.toMap(
                        Car::getId,
                        mapper::toApi,
                        (u, v) -> {
                            throw new IllegalStateException(String.format("Duplicate key %s", u));
                        },
                        LinkedHashMap::new));

        final var drivers = reservationsInPeriod
            .stream()
            .peek(r -> carReservations
                    .get(r.getCar().getId())
                    .addReservationsItem(mapper.toApi(r)))
            .filter(r -> (r instanceof CarSharing))
            .map(r -> ((CarSharing) r).getDriver())
            .collect(Collectors.toList());

        final var result = new CarSharingCalendar();
        result.setDrivers(mapper.toApi(drivers));
        result.setCars(List.copyOf(carReservations.values()));

        return ResponseEntity.ok(result);

    }

    @Override
    public ResponseEntity<Void> addCarSharingReservation(
            final String carId,
            final CarSharingReservation carSharingReservation) {

        if ((carSharingReservation == null)
                || (carSharingReservation.getType() != CarSharingReservationType.CS)) {
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
        final var overlappings = reservationService.checkForOverlappings(
                car.get(),
                carSharingReservation.getStartsAt(),
                carSharingReservation.getEndsAt());
        if (!overlappings.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        try {
            carSharingService.addCarSharing(
                    car.get(),
                    carSharingReservation.getStartsAt(),
                    carSharingReservation.getEndsAt(),
                    driver);
        } catch (Exception e) {
            logger.error("Could not add car-sharing", e);
            return ResponseEntity.internalServerError().build();
        }

        return ResponseEntity.ok().build();

    }

}
