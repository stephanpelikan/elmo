package at.elmo.reservation.passengerservice.shift.overview;

import java.util.ArrayList;
import java.util.List;

public class ShiftOverviewDay {

    private String description;

    private String date;

    private List<ShiftOverviewHour> hours = new ArrayList<>();

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<ShiftOverviewHour> getHours() {
        return hours;
    }

    public void setHours(List<ShiftOverviewHour> hours) {
        this.hours = hours;
    }
    
}
