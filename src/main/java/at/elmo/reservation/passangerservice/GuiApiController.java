package at.elmo.reservation.passangerservice;

import static at.elmo.reservation.passangerservice.shift.ShiftService.mapKeyOfHour;

import at.elmo.car.Car;
import at.elmo.car.CarService;
import at.elmo.gui.api.v1.PassangerServiceApi;
import at.elmo.gui.api.v1.ShiftOverview;
import at.elmo.gui.api.v1.ShiftOverviewDay;
import at.elmo.gui.api.v1.ShiftOverviewHour;
import at.elmo.gui.api.v1.ShiftOverviewWeek;
import at.elmo.gui.api.v1.ShiftStatus;
import at.elmo.reservation.passangerservice.shift.Shift;
import at.elmo.reservation.passangerservice.shift.ShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.HashMap;
import java.util.Locale;

@RestController("passangerServiceGuiApi")
@RequestMapping("/api/v1")
@Secured("MEMBER")
public class GuiApiController implements PassangerServiceApi {
    
    @Autowired
    private ShiftService shiftService;

    @Autowired
    private CarService carService;

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
            
            final var mapKeyOfHour = mapKeyOfHour(startOfOverview, hour);

            if (! hours.containsKey(mapKeyOfHour)) {
                final var newHour = new ShiftOverviewHour();
                newHour.setStatus(ShiftStatus.NO_SHIFT);
                if (shifts.containsKey(mapKeyOfHour)) {
                    newHour.setDescription(Integer.toString(hour.getHour()));
                }
                hours.put(mapKeyOfHour, newHour);
                day.addHoursItem(newHour);
            }
            final var shiftHour = hours.get(mapKeyOfHour);
            
            final var carCounter = carCounters.getOrDefault(mapKeyOfHour, -1);
            if (carCounter == -1) {
                shiftHour.setStatus(ShiftStatus.NO_SHIFT);
            } else if (carCounter == 0) {
                shiftHour.setStatus(ShiftStatus.FREE);
            } else if (carCounter == numberOfCars) {
                shiftHour.setStatus(ShiftStatus.COMPLETE);
            } else {
                shiftHour.setStatus(ShiftStatus.PARTIAL);
            }
            
            final var car = cars.get(mapKeyOfHour);
            if (car != null) {
                shiftHour.setCarId(car.getId());
            }
            
        }
        
        return ResponseEntity.ok(result);
        
    }

}
