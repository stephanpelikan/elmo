package at.elmo.reservation.planner;

import at.elmo.car.Car;
import at.elmo.car.CarService;
import at.elmo.gui.api.v1.DriverApi;
import at.elmo.gui.api.v1.PlannerCalendar;
import at.elmo.gui.api.v1.PlannerCalendarRequest;
import at.elmo.gui.api.v1.ShiftOverview;
import at.elmo.gui.api.v1.ShiftOverviewDay;
import at.elmo.gui.api.v1.ShiftOverviewHour;
import at.elmo.gui.api.v1.ShiftOverviewWeek;
import at.elmo.gui.api.v1.ShiftStatus;
import at.elmo.reservation.ReservationService;
import at.elmo.reservation.carsharing.CarSharing;
import at.elmo.reservation.carsharing.CarSharingProperties;
import at.elmo.reservation.passangerservice.shift.Shift;
import at.elmo.reservation.passangerservice.shift.ShiftService;
import at.elmo.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController("plannerGuiApi")
@RequestMapping("/api/v1")
@Secured("DRIVER")
public class GuiApiController implements DriverApi {

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
            .filter(r -> (r instanceof CarSharing))
            .map(r -> ((CarSharing) r).getDriver())
            .collect(Collectors.toSet());

        final var driver = userContext.getLoggedInMember();

        final var result = new PlannerCalendar()
                .drivers(mapper.toApi(drivers))
                .cars(List.copyOf(carReservations.values()))
                .remainingHours(
                        driver.getHoursServedPassangerService()
                        - driver.getHoursConsumedCarSharing())
                .maxHours(csProperties.getMaxHours())
                .allowPaidCarSharing(csProperties.isAllowPaidCarSharing());

        return ResponseEntity.ok(result);

    }

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
        final var hourCounters = new HashMap<Integer, Integer>();
        shiftService.getShifts(
                startOfOverview,
                endOfOverview)
                .forEach(shift -> {
                        shifts.put(
                                shift.getStartsAt().getHour() + shift.getStartsAt().getDayOfYear() * 24,
                                shift);
                        for (LocalDateTime hour = shift.getStartsAt()
                                ; !hour.equals(shift.getEndsAt())
                                ; hour = hour.plusHours(1)) {
                            
                            final var currentHour = hour.getHour() + hour.getDayOfYear() * 24;
                            var counter = carCounters.getOrDefault(currentHour, 0);
                            if (shift.getDriver() != null) {
                                counter += 1;
                            }
                            carCounters.put(currentHour, counter);
                            
                            if (!cars.containsKey(currentHour)) {
                                cars.put(currentHour, shift.getCar());
                            }
                            
                            var hourCounter = hourCounters.getOrDefault(hour.getHour(), 0);
                            hourCounters.put(hour.getHour(), hourCounter + 1);
                            
                        }
                });
        
        final var weeks = new HashMap<Integer, ShiftOverviewWeek>();
        final var days = new HashMap<Integer, ShiftOverviewDay>();
        final var hours = new HashMap<Integer, ShiftOverviewHour>();
        final var result = new ShiftOverview();
        
        final var numberOfCars = carService.getCountOfPassangerServiceCars();
        result.setNumberOfCars(Integer.valueOf((int) numberOfCars));
        
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
            
            final var currentHour = hour.getHour() + hour.getDayOfYear() * 24;
            if (! hours.containsKey(currentHour)) {
                final var newHour = new ShiftOverviewHour();
                newHour.setStatus(ShiftStatus.NO_SHIFT);
                if (shifts.containsKey(currentHour)) {
                    newHour.setDescription(Integer.toString(hour.getHour()));
                }
                hours.put(currentHour, newHour);
                day.addHoursItem(newHour);
            }
            final var shiftHour = hours.get(currentHour);
            
            final var carCounter = carCounters.getOrDefault(currentHour, -1);
            if (carCounter == -1) {
                shiftHour.setStatus(ShiftStatus.NO_SHIFT);
            } else if (carCounter == 0) {
                shiftHour.setStatus(ShiftStatus.FREE);
            } else if (carCounter == numberOfCars) {
                shiftHour.setStatus(ShiftStatus.COMPLETE);
            } else {
                shiftHour.setStatus(ShiftStatus.PARTIAL);
            }
            
            final var car = cars.get(currentHour);
            if (car != null) {
                shiftHour.setCarId(car.getId());
            }
            
        }
        
        return ResponseEntity.ok(result);
        
    }
    
}
