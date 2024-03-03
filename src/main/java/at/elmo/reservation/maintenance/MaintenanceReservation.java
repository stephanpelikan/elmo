package at.elmo.reservation.maintenance;

import at.elmo.reservation.ConsumingReservation;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(MaintenanceReservation.TYPE)
public class MaintenanceReservation extends ConsumingReservation {

    public static final String TYPE = "M";

    @Column(name = "REASON")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

}
