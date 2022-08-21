package at.elmo.reservation.shift;

import at.elmo.config.ElmoProperties;
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
    private ShiftRepository shiftRepository;

    @Autowired
    private ShiftLifecycle shiftLifecycle;

    //Generated Shifts for one Day in three Months
    @Scheduled(cron = "0 0 * * * *")
    public void createFutureShifts() throws Exception {
        for (ElmoProperties.Shift configuredShift : elmoProperties.getShifts()) {
            LocalDate date = LocalDate.now().plusMonths(3);
            this.createShift(configuredShift, date);
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void createInitialShifts() throws Exception {
        if (shiftRepository.findAll().size() != 0) {
            logger.debug("DB not empty, no shifts created");
            return;
        }
        for (ElmoProperties.Shift configuredShift : elmoProperties.getShifts()) {
            for (LocalDate date = LocalDate.now().plusDays(1); date.isBefore(LocalDate.now().plusMonths(3)); date = date.plusDays(1)) {
                this.createShift(configuredShift, date);
            }
        }
    }

    private void createShift(ElmoProperties.Shift configuredShift, LocalDate date) throws Exception {
        Shift shift = new Shift();
        if (!configuredShift.getDays().contains(date.getDayOfWeek().getValue())) {
            return;
        }
        shift.setStartsAt(date.atTime(LocalTime.parse(configuredShift.getStart())));
        shift.setEndsAt(date.atTime(LocalTime.parse(configuredShift.getEnd())));

        final var result = shiftRepository.saveAndFlush(shift);
        shiftLifecycle.createShift(result);
    }
}
