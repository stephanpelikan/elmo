package at.elmo.reservation.passengerservice.shift;

import at.elmo.member.Role;
import at.elmo.util.spring.NotificationEvent;

import java.util.List;

public class ShiftChangedNotification extends NotificationEvent {

    private static final long serialVersionUID = 1L;

    private final String id;

    public ShiftChangedNotification(
            final Type type,
            final String id) {
        
        super(
                "Shift",
                type,
                List.of(Role.ADMIN, Role.MANAGER, Role.DRIVER, Role.PASSENGER));
        this.id = id;
        
    }
    
    public String getId() {
        return id;
    }
    
}
