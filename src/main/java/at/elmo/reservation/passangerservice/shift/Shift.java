package at.elmo.reservation.passangerservice.shift;

import at.elmo.member.Member;
import at.elmo.reservation.ReservationBase;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
@DiscriminatorValue("S")
public class Shift extends ReservationBase {

    @ManyToOne()
    @JoinColumn(name = "MEMBER", referencedColumnName = "ID")
    private Member driver;

    //TODO add rides to this table later

    public Member getDriver() {
        return driver;
    }

    public void setDriver(Member driver) {
        this.driver = driver;
    }
}