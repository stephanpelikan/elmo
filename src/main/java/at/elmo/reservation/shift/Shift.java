package at.elmo.reservation.shift;

import at.elmo.member.Member;
import at.elmo.reservation.ReservationBase;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import java.time.OffsetDateTime;
import java.util.Set;


@Entity
@DiscriminatorValue("SHIFT")
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