package at.elmo.reservation.passengerservice.shift.overview;

import java.util.ArrayList;
import java.util.List;

public class ShiftOverviewWeek {

    private String description;

    private String startsAt;

    private String endsAt;

    private List<ShiftOverviewDay> days = new ArrayList<>();

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStartsAt() {
        return startsAt;
    }

    public void setStartsAt(String startsAt) {
        this.startsAt = startsAt;
    }

    public String getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(String endsAt) {
        this.endsAt = endsAt;
    }

    public List<ShiftOverviewDay> getDays() {
        return days;
    }

    public void setDays(List<ShiftOverviewDay> days) {
        this.days = days;
    }

}
