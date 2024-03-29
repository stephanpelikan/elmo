package at.elmo.reservation.planner;

import at.elmo.car.Car;
import at.elmo.car.CarService;
import at.elmo.gui.api.v1.PlannerApi;
import at.elmo.gui.api.v1.PlannerCalendar;
import at.elmo.gui.api.v1.PlannerCalendarRequest;
import at.elmo.member.Role;
import at.elmo.reservation.DriverBasedReservation;
import at.elmo.reservation.ReservationService;
import at.elmo.reservation.carsharing.CarSharingProperties;
import at.elmo.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController("plannerGuiApi")
@RequestMapping("/api/v1")
@Secured({ Role.ROLE_DRIVER, Role.ROLE_MANAGER, Role.ROLE_ADMIN })
public class GuiApiController implements PlannerApi {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private GuiApiMapper mapper;

    @Autowired
    private CarService carService;

    @Autowired
    private CarSharingProperties csProperties;
    
    @Autowired
    private UserContext userContext;

    @Override
    public ResponseEntity<PlannerCalendar> getPlannerCalendar(
            final PlannerCalendarRequest request) {

        if ((request == null)
                || (request.getStartsAt() == null)
                || (request.getEndsAt() == null)) {
            return ResponseEntity.badRequest().build();
        }

        final var reservationsInPeriod = reservationService.findReservations(
                request.getStartsAt(),
                request.getEndsAt());

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
            .filter(r -> r instanceof DriverBasedReservation)
            .map(r ->  ((DriverBasedReservation) r).getDriver())
            .filter(driver -> driver != null)
            .collect(Collectors.toSet());

        final var driver = userContext.getLoggedInMember();

        final var result = new PlannerCalendar()
                .drivers(mapper.toApi(drivers))
                .cars(List.copyOf(carReservations.values()))
                .remainingHours(
                        driver.getHoursServedPassengerService()
                        - driver.getHoursConsumedCarSharing())
                .maxHours(csProperties.getMaxHours())
                .allowPaidCarSharing(csProperties.isAllowPaidCarSharing());

        return ResponseEntity.ok(result);

    }

}
