package at.elmo.reservation.passengerservice;

import at.elmo.car.Car;
import at.elmo.car.CarService;
import at.elmo.gui.api.v1.PassengerServiceApi;
import at.elmo.gui.api.v1.ShiftOverview;
import at.elmo.gui.api.v1.ShiftOverviewDay;
import at.elmo.gui.api.v1.ShiftOverviewHour;
import at.elmo.gui.api.v1.ShiftOverviewStatus;
import at.elmo.gui.api.v1.ShiftOverviewWeek;
import at.elmo.gui.api.v1.ShiftReservation;
import at.elmo.gui.api.v1.Shifts;
import at.elmo.member.MemberService;
import at.elmo.member.Role;
import at.elmo.reservation.DriverBasedReservation;
import at.elmo.reservation.ReservationService;
import at.elmo.reservation.carsharing.CarSharing;
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

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import javax.validation.Valid;

import static at.elmo.reservation.passengerservice.shift.ShiftService.mapKeyOfHour;

@RestController("passengerServiceGuiApi")
@RequestMapping("/api/v1")
@Secured(Role.ROLE_PASSENGER)
public class GuiApiController implements PassengerServiceApi {
    
    @Autowired
    private UserContext userContext;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private ShiftService shiftService;

    @Autowired
    private CarService carService;

    @Autowired
    private GuiApiMapper mapper;

    @Autowired
    private MemberService memberService;

    @Override
    public ResponseEntity<ShiftOverview> getShiftOverview() {
        
        final var now = LocalDateTime
                .now();
        
        final var startOfOverview = now
                .truncatedTo(ChronoUnit.DAYS)
                .minusDays(now.getDayOfWeek().getValue() - 1);
        final var endOfOverview = startOfOverview
                .plusWeeks(2);
        
        final var carCounters = new HashMap<Integer, Integer>();
        final var cars = new HashMap<Integer, Car>();
        final var shifts = new HashMap<Integer, Shift>();
        
        shiftService.getShifts(
                startOfOverview,
                endOfOverview)
                .forEach(shift -> {
                        shifts.put(
                                mapKeyOfHour(startOfOverview, shift.getStartsAt()),
                                shift);
                        for (LocalDateTime hour = shift.getStartsAt()
                                ; !hour.equals(shift.getEndsAt())
                                ; hour = hour.plusHours(1)) {
                            
                            final var mapKeyOfHour = mapKeyOfHour(startOfOverview, hour);
                            
                            var counter = carCounters.getOrDefault(mapKeyOfHour, 0);
                            if (shift.getDriver() != null) {
                                counter += 1;
                            }
                            carCounters.put(mapKeyOfHour, counter);
                            
                            if (!cars.containsKey(mapKeyOfHour)) {
                                cars.put(mapKeyOfHour, shift.getCar());
                            }
                            
                        }
                });
        
        final var weeks = new HashMap<Integer, ShiftOverviewWeek>();
        final var days = new HashMap<Integer, ShiftOverviewDay>();
        final var hours = new HashMap<Integer, ShiftOverviewHour>();
        final var result = new ShiftOverview();

        final var numberOfCars = carService.getCountOfPassengerServiceCars();
        result.setNumberOfCars((int) numberOfCars);
        
        var hasPartials = false;
        
        for (LocalDateTime hour = startOfOverview
                ; !hour.equals(endOfOverview)
                ; hour = hour.plusHours(1)) {
            
            final var currentWeek = hour.get(
                    WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
            if (! weeks.containsKey(currentWeek)) {
                final var newWeek = new ShiftOverviewWeek();
                newWeek.setDescription(Integer.toString(currentWeek));
                newWeek.setStartsAt(hour.toLocalDate().toString());
                newWeek.setEndsAt(hour.plusDays(6).toLocalDate().toString());
                weeks.put(currentWeek, newWeek);
                result.addWeeksItem(newWeek);
            }
            final var week = weeks.get(currentWeek);
            
            final var currentDay = hour.getDayOfYear();
            if (! days.containsKey(currentDay)) {
                final var newDay = new ShiftOverviewDay();
                newDay.setDate(hour.toLocalDate().toString());
                newDay.setDescription(Integer.toString(hour.getDayOfMonth()));
                days.put(currentDay, newDay);
                week.addDaysItem(newDay);
            }
            final var day = days.get(currentDay);
            
            final var mapKeyOfHour = mapKeyOfHour(startOfOverview, hour);

            if (! hours.containsKey(mapKeyOfHour)) {
                final var newHour = new ShiftOverviewHour();
                newHour.setEndsAt(hour.plusHours(1));
                newHour.setStatus(ShiftOverviewStatus.NO_SHIFT);
                if (shifts.containsKey(mapKeyOfHour)) {
                    newHour.setDescription(Integer.toString(hour.getHour()));
                }
                hours.put(mapKeyOfHour, newHour);
                day.addHoursItem(newHour);
            }
            final var shiftHour = hours.get(mapKeyOfHour);
            
            final var carCounter = carCounters.getOrDefault(mapKeyOfHour, -1);
            if (carCounter == -1) {
                shiftHour.setStatus(ShiftOverviewStatus.NO_SHIFT);
            } else if (carCounter == 0) {
                shiftHour.setStatus(ShiftOverviewStatus.FREE);
            } else if (carCounter == numberOfCars) {
                shiftHour.setStatus(ShiftOverviewStatus.COMPLETE);
            } else {
                shiftHour.setStatus(ShiftOverviewStatus.PARTIAL);
                hasPartials = true;
            }
            
            final var car = cars.get(mapKeyOfHour);
            if (car != null) {
                shiftHour.setCarId(car.getId());
            }
            
        }
        
        result.setHasPartials(hasPartials);
        
        return ResponseEntity.ok(result);
        
    }

    @Override
    @Secured(Role.ROLE_DRIVER)
    public ResponseEntity<Shifts> getMyShifts(
            final @Valid Integer pageNumber,
            final @Valid Integer pageSize) {

        final var shifts = shiftService.getShifts(
                pageNumber,
                pageSize,
                userContext.getLoggedInMember());
                
        final var result = new Shifts();
        result.setShifts(
                mapper.toApi(shifts.getContent()));
        result.setPage(
                mapper.toApi(shifts));

        return ResponseEntity.ok(result);

    }
    
    @Override
    public ResponseEntity<List<ShiftReservation>> getUpcomingPassengerServiceShifts() {

        final var driver = userContext.getLoggedInMember();
        
        final var shifts = shiftService.getUpcomingPassengerServicesShifts(driver);
        
        final var result = mapper.toApi(shifts);
        
        return ResponseEntity.ok(result);

    }


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

}
