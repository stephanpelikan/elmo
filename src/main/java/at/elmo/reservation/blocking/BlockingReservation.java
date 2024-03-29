package at.elmo.reservation.blocking;

import at.elmo.reservation.ReservationBase;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(BlockingReservation.TYPE)
public class BlockingReservation extends ReservationBase {

    public static final String TYPE = "B";
    
    @Column(name = "REASON")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

}
