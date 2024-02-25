package at.elmo.reservation.passengerservice.shift;

import at.elmo.car.Car;
import at.elmo.car.CarService;
import at.elmo.reservation.blocking.BlockingService;
import at.elmo.reservation.passengerservice.PassengerServiceProperties;
import at.elmo.util.config.ConfigService;
import at.elmo.util.holiday.HolidayService;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Stream;

@Component
public class ShiftGenerator {

    @Autowired
    private Logger logger;

    @Autowired
    private PassengerServiceProperties properties;

    @Autowired
    private ConfigService configs;

    @Autowired
    private CarService carService;

    @Autowired
    private ShiftService shiftService;

    @Autowired
    private BlockingService blockingService;

    @Autowired
    private HolidayService holidayService;

    @EventListener(ApplicationReadyEvent.class)
    public void init() {

        carService.buildPredefinedCars();

        generateShifts();

    }

    @Scheduled(cron = "0 0 4 * * *")
    public void generateShifts() {

        carService
                .getPassengerServiceCars()
                .stream()
                .forEach(this::generateShiftsForCar);

    }

    private void generateShiftsForCar(
            final Car car) {

        var lastCreatedShiftDate = configs.getLastShiftGenerationDate(car.getId());
        final var generateUntil = LocalDate.now().plusDays(
                properties.getDaysForInitialShiftCreation());
        if(generateUntil.isBefore(lastCreatedShiftDate)){
            return;
        }

        final var fromDate = lastCreatedShiftDate.plusDays(1);

        logger.info("Creating shifts for car '{}' from {} to {}",
                car.getShortcut(),
                fromDate,
                generateUntil);

        Stream
                .iterate(fromDate, day -> day.plusDays(1))
                .limit(ChronoUnit.DAYS.between(fromDate, generateUntil))
                .forEach(day -> {

                    final var boundaries = new LocalDateTime[] { null, null };
                    properties
                            .getShifts()
                            .getOrDefault(day.getDayOfWeek(), List.of())
                            .stream()
                            .filter(shift -> shift.isHoliday() == holidayService.isHoliday(day))
                            .map(shift -> {
                                Shift result;
                                try {
                                    final var startsAt = day.atTime(LocalTime.parse(shift.getStart()));
                                    final var endsAt = day.atTime(LocalTime.parse(shift.getEnd()));
                                    result = shiftService.createShift(car, startsAt, endsAt, null);
                                } catch (UnsupportedOperationException e) {
                                    logger.error("Could not create shift since there was already an overlapping shift!");
                                    result = null;
                                } catch (Exception e) {
                                    logger.error("Could not create shift!", e);
                                    result = null;
                                }
                                return result;
                            })
                            .filter(shift -> shift != null)
                            .forEach(shift -> {
                                if (boundaries[0] == null) {
                                    boundaries[0] = shift.getStartsAt();
                                } else if (shift.getStartsAt().isBefore(boundaries[0])) {
                                    boundaries[0] = shift.getStartsAt();
                                }
                                if (boundaries[1] == null) {
                                    boundaries[1] = shift.getEndsAt();
                                } else if (shift.getEndsAt().isAfter(boundaries[1])) {
                                    boundaries[1] = shift.getEndsAt();
                                }
                            });

                    final var startOfDay = day.atStartOfDay();
                    if ((boundaries[0] != null)
                            && boundaries[0].isAfter(startOfDay)) {
                        try {
                            blockingService.createBlocking(
                                    car,
                                    startOfDay,
                                    boundaries[0]);
                        } catch (Exception e) {
                            logger.error("Could not create shift!", e);
                        }
                    }
                    final var endOfDay = day.plusDays(1).atStartOfDay();
                    if ((boundaries[1] != null)
                            && boundaries[1].isBefore(endOfDay)) {
                        try {
                            blockingService.createBlocking(
                                    car,
                                    boundaries[1],
                                    endOfDay);
                        } catch (Exception e) {
                            logger.error("Could not create shift!", e);
                        }
                    }

                    configs.setLastShiftGenerationDate(car.getId(), day);

                });

    }

}
