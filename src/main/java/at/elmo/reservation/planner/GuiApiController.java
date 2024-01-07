package at.elmo.reservation.planner;

import at.elmo.car.Car;
import at.elmo.car.CarService;
import at.elmo.gui.api.v1.PlannerApi;
import at.elmo.gui.api.v1.PlannerCalendar;
import at.elmo.gui.api.v1.PlannerCalendarRequest;
import at.elmo.member.MemberService;
import at.elmo.member.Role;
import at.elmo.reservation.DriverBasedReservation;
import at.elmo.reservation.ReservationService;
import at.elmo.reservation.carsharing.CarSharing;
import at.elmo.reservation.carsharing.CarSharingProperties;
import at.elmo.reservation.passengerservice.shift.Shift;
import at.elmo.reservation.passengerservice.shift.ShiftService;
import at.elmo.reservation.passengerservice.shift.exceptions.UnknownShiftException;
import at.elmo.util.UserContext;
import at.elmo.util.exceptions.ElmoValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    
    @Autowired
    private ShiftService shiftService;

    @Autowired
    private MemberService memberService;

    @Override
    public ResponseEntity<Void> requestSwapOfShift(
            final String shiftId) {

        try {

            final var initiated = shiftService.requestSwapOfShift(
                    shiftId,
                    userContext.getLoggedInMember());
            if (!initiated) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            return ResponseEntity.ok().build();

        } catch (UnknownShiftException e) {
            return ResponseEntity.notFound().build();
        }

    }

    @Override
    public ResponseEntity<Void> requestSwapOfShiftByAdministrator(
            final String shiftId,
            final Integer driverMemberIdRequestingSwap) {

        try {

            final var driverFound = memberService.getMember(
                    driverMemberIdRequestingSwap);
            if (driverFound.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            final var driver = driverFound.get();
            if (!driver.hasRole(Role.DRIVER)) {
                return ResponseEntity.badRequest().build();
            }

            final var initiated = shiftService.requestSwapOfShift(
                    shiftId,
                    userContext.getLoggedInMember());
            if (!initiated) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            return ResponseEntity.ok().build();

        } catch (UnknownShiftException e) {
            return ResponseEntity.notFound().build();
        }

    }

    @Override
    public ResponseEntity<Void> confirmSwapOfShift(
            final String shiftId) {

        try {

            final var accepted = shiftService.confirmSwapOfShift(
                    shiftId,
                    userContext.getLoggedInMember());
            if (!accepted) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            return ResponseEntity.ok().build();

        } catch (UnknownShiftException e) {
            return ResponseEntity.notFound().build();
        }

    }

    @Override
    public ResponseEntity<Void> cancelOrRejectSwapOfShift(
            final String shiftId) {

        try {

            final var cancelled = shiftService.cancelRequestForSwapOfShift(
                    shiftId,
                    userContext.getLoggedInMember());
            if (cancelled) {
                return ResponseEntity.ok().build();
            }

            final var rejected = shiftService.rejectRequestForSwapOfShift(
                    shiftId,
                    userContext.getLoggedInMember());
            if (rejected) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            return ResponseEntity.ok().build();

        } catch (UnknownShiftException e) {
            return ResponseEntity.notFound().build();
        }

    }

    @Override
    public ResponseEntity<Void> claimShift(
            final String shiftId) {
        
        try {
            
            final var driver = userContext
                    .getLoggedInMember();
            
            final var shiftFound = shiftService.getShift(shiftId);
            if (shiftFound.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            final var shift = shiftFound.get();
            
            reservationService.findReservations(
                    shift.getStartsAt(),
                    shift.getEndsAt())
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
                                    "parallel-passengerservice",
                                    reservation.getCar().getName());
                        }
                    });

            final var claimed = shiftService
                    .claimShift(shiftId, driver);
            if (!claimed) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            
            return ResponseEntity.ok().build();
        
        } catch (UnknownShiftException e) {
            return ResponseEntity.notFound().build();
        }

    }
    
    @Override
    public ResponseEntity<Void> unclaimShift(
            final String shiftId) {
        
        try {
            
            final var driver = userContext
                    .getLoggedInMember();

            final var unclaimed = shiftService
                    .unclaimShift(shiftId, driver);
            if (unclaimed) {
                return ResponseEntity.ok().build();
            }
            
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        
        } catch (UnknownShiftException e) {
            return ResponseEntity.notFound().build();
        }

    }
    
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
