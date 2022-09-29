package at.elmo.reservation.carsharing;

import at.elmo.car.CarService;
import at.elmo.gui.api.v1.CarSharingApi;
import at.elmo.gui.api.v1.CarSharingCalendar;
import at.elmo.gui.api.v1.CarSharingCalendarRequest;
import at.elmo.gui.api.v1.CarSharingReservation;
import at.elmo.reservation.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedList;
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

        final var cars = carService.getCarSharingCars();

        final var reservations = new LinkedList<CarSharingReservation>();
        final var drivers = reservationsInPeriod
            .stream()
            .peek(r -> reservations.add(mapper.toApi(r)))
            .filter(r -> (r instanceof CarSharing))
            .map(r -> ((CarSharing) r).getDriver())
            .collect(Collectors.toList());

        final var result = new CarSharingCalendar();
        result.setDrivers(mapper.toApi(drivers));
        result.setCars(mapper.toApi(cars));
        result.setReservations(reservations);

        return ResponseEntity.ok(result);

    }

}
