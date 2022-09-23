package at.elmo.reservation.passangerservice;

import at.elmo.reservation.passangerservice.shift.ShiftProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.lang.NonNull;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Map;

@ConfigurationProperties(prefix = "elmo.passanger-service", ignoreUnknownFields = false)
public class PassangerServiceProperties {

    @NonNull
    private int daysForInitialShiftCreation;

    private Map<DayOfWeek, List<ShiftProperties>> shifts;

    public int getDaysForInitialShiftCreation() {
        return daysForInitialShiftCreation;
    }

    public void setDaysForInitialShiftCreation(int daysForInitialShiftCreation) {
        this.daysForInitialShiftCreation = daysForInitialShiftCreation;
    }

    public Map<DayOfWeek, List<ShiftProperties>> getShifts() {
        return shifts;
    }

    public void setShifts(Map<DayOfWeek, List<ShiftProperties>> shifts) {
        this.shifts = shifts;
    }

}
