package at.elmo.reservation;

import org.springframework.context.ApplicationEvent;

import java.time.LocalDateTime;

public class ReservationNotification extends ApplicationEvent {

    private static final long serialVersionUID = 1L;

    final LocalDateTime startsAt;
    
    final LocalDateTime endsAt;
    
    private final String carId;
    
    public ReservationNotification(
            final Object source,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt,
            final String carId) {
        
        super(source);
        this.carId = carId;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        
    }
    
    public String getCarId() {
        return carId;
    }
    
    public LocalDateTime getStartsAt() {
        return startsAt;
    }
    
    public LocalDateTime getEndsAt() {
        return endsAt;
    }
    
}
