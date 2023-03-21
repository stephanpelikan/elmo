package at.elmo.reservation.passangerservice.shift;

import at.elmo.member.Member;
import at.elmo.reservation.DriverBasedReservation;
import at.elmo.reservation.ReservationBase;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
@DiscriminatorValue(Shift.TYPE)
public class Shift extends ReservationBase implements DriverBasedReservation {
    
    public static final String TYPE = "S";

    @ManyToOne()
    @JoinColumn(name = "MEMBER", referencedColumnName = "ID")
    private Member driver;

    //TODO add rides to this table later

    @Override
    public Member getDriver() {
        return driver;
    }

    public void setDriver(Member driver) {
        this.driver = driver;
    }
}