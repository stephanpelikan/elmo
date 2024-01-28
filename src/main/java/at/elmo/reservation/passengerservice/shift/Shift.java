package at.elmo.reservation.passengerservice.shift;

import at.elmo.member.Member;
import at.elmo.reservation.ConsumingReservation;

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
public class Shift extends ConsumingReservation {
    
    public static final String TYPE = "S";

    public static enum Status {
        UNCLAIMED, CLAIMED, IN_PROGRESS, CANCELLED, DONE
    };

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private Status status;
    
    @ManyToOne()
    @JoinColumn(name = "MEMBER_FOR_SWAP", referencedColumnName = "ID")
    private Member driverRequestingSwap;

    @ManyToOne()
    @JoinColumn(name = "PREVIOUS_DRIVER", referencedColumnName = "ID")
    private Member previousDriver;

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
    
    public Member getDriverRequestingSwap() {
        return driverRequestingSwap;
    }
    
    public void setDriverRequestingSwap(Member driverRequestingSwap) {
        this.driverRequestingSwap = driverRequestingSwap;
    }

    public Member getPreviousDriver() {
        return previousDriver;
    }

    public void setPreviousDriver(Member previousDriver) {
        this.previousDriver = previousDriver;
    }

    public String getOneHourBeforeStart() {
        
        return getStartsAt()
                .minusHours(1)
                .format(DateTimeFormatter.ISO_DATE_TIME);
        
    }

    public boolean isWithinOneHourBeforeStart() {

        return getStartsAt()
                .minusHours(1)
                .isBefore(LocalDateTime.now());

    }

    public boolean isWithinThreeHoursBeforeStart() {

        return getStartsAt()
                .minusHours(3)
                .isBefore(LocalDateTime.now());

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