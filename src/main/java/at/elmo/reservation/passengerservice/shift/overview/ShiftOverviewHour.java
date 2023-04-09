package at.elmo.reservation.passengerservice.shift.overview;

import java.time.LocalDateTime;

public class ShiftOverviewHour {
    
    private LocalDateTime startsAt;
    
    private LocalDateTime endsAt;

    private int durationInHours;
    
    private String description;

    private String carId;

    private ShiftStatus status;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCarId() {
        return carId;
    }

    public void setCarId(String carId) {
        this.carId = carId;
    }

    public ShiftStatus getStatus() {
        return status;
    }

    public void setStatus(ShiftStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getStartsAt() {
        return startsAt;
    }
    
    public void setStartsAt(LocalDateTime startsAt) {
        this.startsAt = startsAt;
    }
    
    public int getDurationInHours() {
        return durationInHours;
    }
    
    public void setDurationInHours(int durationInHours) {
        this.durationInHours = durationInHours;
    }

    public LocalDateTime getEndsAt() {
        return endsAt;
    }
    
    public void setEndsAt(LocalDateTime endsAt) {
        this.endsAt = endsAt;
    }
    
}
