package at.elmo.reservation;

import at.elmo.member.Role;
import at.elmo.util.spring.NotificationEvent;

import java.time.LocalDateTime;
import java.util.List;

public class ReservationNotification extends NotificationEvent {

    private static final long serialVersionUID = 1L;

    private final String id;
    
    private final Integer driverMemberId;
    
    private final LocalDateTime startsAt;
    
    private final LocalDateTime endsAt;
    
    private final String carId;
    
    public ReservationNotification(
            final Object source,
            final Type type,
            final String id,
            final Integer driverMemberId,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt,
            final String carId) {
        
        super(source, type, List.of(Role.ADMIN, Role.MANAGER, Role.DRIVER));
        this.id = id;
        this.driverMemberId = driverMemberId;
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

    public Integer getDriverMemberId() {
        return driverMemberId;
    }
    
}
