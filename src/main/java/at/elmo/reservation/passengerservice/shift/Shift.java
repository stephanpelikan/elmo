package at.elmo.reservation.passengerservice.shift;

import at.elmo.member.Member;
import at.elmo.reservation.DriverBasedReservation;
import at.elmo.reservation.ReservationBase;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
@DiscriminatorValue(Shift.TYPE)
public class Shift extends ReservationBase implements DriverBasedReservation {
    
    public static final String TYPE = "S";

    public static enum Status {
        UNCLAIMED, CLAIMED, IN_PROGRESS, CANCELLED, DONE
    };

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private Status status;

    @ManyToOne()
    @JoinColumn(name = "MEMBER", referencedColumnName = "ID")
    private Member driver;
    
    @ManyToOne()
    @JoinColumn(name = "MEMBER_FOR_SWAP", referencedColumnName = "ID")
    private Member driverRequestingSwap;
    
    private transient List<String> rides = List.of(); // TODO add rides to this table later
    
    public Status getStatus() {
        return status;
    }
    
    public void setStatus(Status status) {
        this.status = status;
    }
    
    public List<String> getRides() {
        return rides;
    }

    public void setRides(List<String> rides) {
        this.rides = rides;
    }

    @Override
    public Member getDriver() {
        return driver;
    }

    public void setDriver(Member driver) {
        this.driver = driver;
    }
    
    public Member getDriverRequestingSwap() {
        return driverRequestingSwap;
    }
    
    public void setDriverRequestingSwap(Member driverRequestingSwap) {
        this.driverRequestingSwap = driverRequestingSwap;
    }
    
    public String getOneHourBeforeStart() {
        
        return getStartsAt()
                .minusHours(1)
                .format(DateTimeFormatter.ISO_DATE_TIME);
        
    }
    
    public String getThreeHoursBeforeStart() {
        
        return getStartsAt()
                .minusHours(3)
                .format(DateTimeFormatter.ISO_DATE_TIME);
        
    }
    
    public String getOneDayBeforeStart() {
        
        return getStartsAt()
                .minusDays(1)
                .format(DateTimeFormatter.ISO_DATE_TIME);
        
    }
    
    public boolean isWithinTwoDaysBeforeStart() {
        
        return getStartsAt()
                .minusDays(2)
                .isBefore(LocalDateTime.now());
        
    }
    
}