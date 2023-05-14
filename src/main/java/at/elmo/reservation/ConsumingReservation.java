package at.elmo.reservation;

import at.elmo.member.Member;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public abstract class ConsumingReservation extends ReservationBase implements DriverBasedReservation {

    @ManyToOne()
    @JoinColumn(name = "MEMBER", referencedColumnName = "ID")
    private Member driver;

    @Column(name = "START_USAGE")
    private LocalDateTime startUsage;
    
    @Column(name = "START_KM")
    private Integer kmAtStart;

    @Column(name = "END_USAGE")
    private LocalDateTime endUsage;

    @Column(name = "END_KM")
    private Integer kmAtEnd;

    @Override
    public Member getDriver() {
        return driver;
    }

    public void setDriver(Member driver) {
        this.driver = driver;
    }

    public Integer getKmAtStart() {
        return kmAtStart;
    }

    public void setKmAtStart(Integer kmAtStart) {
        this.kmAtStart = kmAtStart;
    }
    
    public LocalDateTime getStartUsage() {
        return startUsage;
    }

    public void setStartUsage(LocalDateTime startUsage) {
        this.startUsage = startUsage;
    }

    public LocalDateTime getEndUsage() {
        return endUsage;
    }

    public void setEndUsage(LocalDateTime endUsage) {
        this.endUsage = endUsage;
    }

    public Integer getKmAtEnd() {
        return kmAtEnd;
    }

    public void setKmAtEnd(Integer kmAtEnd) {
        this.kmAtEnd = kmAtEnd;
    }

}
