package at.elmo.reservation.shift;

import at.elmo.config.ElmoProperties;
import at.elmo.util.config.ConfigValue;
import at.elmo.util.config.ConfigValueRepository;
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

    @Autowired
    private ConfigValueRepository configValues;

    //Generated Shifts for one Day in three Months
    @EventListener(ApplicationReadyEvent.class)
    @Scheduled(cron = "0 0 * * * *")
    public void generateShifts() throws Exception {
        final var lastCreatedShift = configValues
            .findById(ConfigValue.LAST_SHIFT_GENERATION_DATE)
            .orElse(new ConfigValue(ConfigValue.LAST_SHIFT_GENERATION_DATE, LocalDate.now().toString()));

        var lastCreatedShiftDate = LocalDate.parse(lastCreatedShift.getValue());
        final var generateUntil = LocalDate.now().plusDays(elmoProperties.getDaysForInitialShiftCreation());
        if(generateUntil.isBefore(lastCreatedShiftDate)){
            return;
        }
        for ( ; lastCreatedShiftDate.isBefore(generateUntil); lastCreatedShiftDate = lastCreatedShiftDate.plusDays(1)) {
            for (ElmoProperties.Shift configuredShift : elmoProperties.getShifts()) {
                Shift shift = new Shift();
                if (!configuredShift.getDays().contains(lastCreatedShiftDate.getDayOfWeek().getValue())) {
                    return;
                }
                shift.setStartsAt(lastCreatedShiftDate.atTime(LocalTime.parse(configuredShift.getStart())));
                shift.setEndsAt(lastCreatedShiftDate.atTime(LocalTime.parse(configuredShift.getEnd())));

                shiftLifecycle.createShift(shift);
            }
        }
        lastCreatedShift.setValue(lastCreatedShiftDate.toString());
        configValues.save(lastCreatedShift);
    }

}
