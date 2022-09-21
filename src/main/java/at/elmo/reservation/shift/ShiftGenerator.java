package at.elmo.reservation.shift;

import at.elmo.car.Car;
import at.elmo.car.CarService;
import at.elmo.config.ElmoProperties;
import at.elmo.util.config.ConfigService;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class ShiftGenerator {

    @Autowired
    private Logger logger;

    @Autowired
    private ElmoProperties elmoProperties;

    @Autowired
    private ConfigService configs;

    @Autowired
    private CarService carService;

    @Autowired
    private ShiftService shiftService;

    @EventListener(ApplicationReadyEvent.class)
    @Scheduled(cron = "0 0 2 * * *")
    public void generateShifts() {

        carService.buildPredefinedCars();

        carService
                .getPassangerServiceCars()
                .stream()
                .forEach(this::generateShiftsForCar);

    }

    private void generateShiftsForCar(
            final Car car) {

        var lastCreatedShiftDate = configs.getLastShiftGenerationDate(car.getId());
        final var generateUntil = LocalDate.now().plusDays(
                elmoProperties.getDaysForInitialShiftCreation());
        if(generateUntil.isBefore(lastCreatedShiftDate)){
            return;
        }

        logger.info("Creating shifts for car '{}' from {} to {}",
                car.getShortcut(),
                lastCreatedShiftDate,
                generateUntil);
        try {
            for ( ; lastCreatedShiftDate.isBefore(generateUntil)
                    ; lastCreatedShiftDate = lastCreatedShiftDate.plusDays(1)) {
                for (ElmoProperties.Shift configuredShift : elmoProperties.getShifts()) {
                    if (!configuredShift.getDays().contains(lastCreatedShiftDate.getDayOfWeek().getValue())) {
                        continue;
                    }
                    shiftService.createShift(
                            car,
                            lastCreatedShiftDate.atTime(LocalTime.parse(configuredShift.getStart())),
                            lastCreatedShiftDate.atTime(LocalTime.parse(configuredShift.getEnd())));
                }
            }
            configs.setLastShiftGenerationDate(
                    car.getId(),
                    lastCreatedShiftDate);
        } catch (Exception e) {
            logger.error("Could not create shift!", e);
        }

    }

}
