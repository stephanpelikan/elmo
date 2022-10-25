package at.elmo.reservation;

import at.elmo.util.spring.NotificationEvent;

import java.time.LocalDateTime;

public class ReservationNotification extends NotificationEvent {

    private static final long serialVersionUID = 1L;

    private final String id;
    
    private final LocalDateTime startsAt;
    
    private final LocalDateTime endsAt;
    
    private final String carId;
    
    public ReservationNotification(
            final Object source,
            final String type,
            final String id,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt,
            final String carId) {
        
        super(source, type);
        this.id = id;
        this.carId = carId;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        
    }
    
    public String getId() {
        return id;
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
