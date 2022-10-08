package at.elmo.reservation.carsharing;

import at.elmo.car.Car;
import at.elmo.car.CarService;
import at.elmo.gui.api.v1.CarSharingApi;
import at.elmo.gui.api.v1.CarSharingCalendar;
import at.elmo.gui.api.v1.CarSharingCalendarRequest;
import at.elmo.reservation.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
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
    private ReservationService reservationService;

    @Autowired
    private GuiApiMapper mapper;

    @Autowired
    private CarService carService;

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

}
