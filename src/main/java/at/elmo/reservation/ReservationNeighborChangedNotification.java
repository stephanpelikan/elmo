package at.elmo.reservation;

import at.elmo.member.Role;
import at.elmo.util.spring.NotificationEvent;

import java.util.List;

public class ReservationNeighborChangedNotification extends NotificationEvent {

    private static final long serialVersionUID = 1L;

    private final String id;
    
    private final String carId;

    private final String newNeighborReservationId;

    private final String oldNeighborReservationId;

    private final boolean previousChanged;

    public ReservationNeighborChangedNotification(
            final Type type,
            final String id,
            final String carId,
            final String oldNeighborReservationId,
            final String newNeighborReservationId,
            final boolean previousChanged) {
        
        super("Reservation#NeighborChanged" + (previousChanged ? "Previous" : "Next"),
                type,
                List.of(Role.ADMIN, Role.MANAGER, Role.DRIVER));
        this.id = id;
        this.carId = carId;
        this.newNeighborReservationId = newNeighborReservationId;
        this.oldNeighborReservationId = oldNeighborReservationId;
        this.previousChanged = previousChanged;
        
    }
    
    public String getId() {
        return id;
    }
    
    public String getCarId() {
        return carId;
    }
    
    public boolean isPreviousChanged() {
        return previousChanged;
    }
    
    public String getNewNeighborReservationId() {
        return newNeighborReservationId;
    }
    
    public String getOldNeighborReservationId() {
        return oldNeighborReservationId;
    }
    
}
