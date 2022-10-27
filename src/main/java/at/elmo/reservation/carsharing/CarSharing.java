package at.elmo.reservation.carsharing;

import at.elmo.member.Member;
import at.elmo.reservation.ReservationBase;

import java.time.format.DateTimeFormatter;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;


@Entity
@DiscriminatorValue(CarSharing.TYPE)
public class CarSharing extends ReservationBase {

    public static final String TYPE = "CS";
    
    public static enum Status {
        RESERVED, ONGOING, COMPLETED, CANCELLED
    };

    @ManyToOne()
    @JoinColumn(name = "MEMBER", referencedColumnName = "ID")
    private Member driver;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS")
    private Status status;

    @Column(name = "CONFIRM_USERTASK")
    private String userTaskId;

    @Column(name = "COMMENT")
    private String comment;
    
    @Column(name = "HOURS_PLANNED")
    private int hoursPlanned;

    public Member getDriver() {
        return driver;
    }

    public void setDriver(Member driver) {
        this.driver = driver;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getUserTaskId() {
        return userTaskId;
    }

    public void setUserTaskId(String userTaskId) {
        this.userTaskId = userTaskId;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public int getHoursPlanned() {
        return hoursPlanned;
    }
    
    public void setHoursPlanned(int hoursPlanned) {
        this.hoursPlanned = hoursPlanned;
    }

    public String getTenMinutesBeforeStart() {

        return getStartsAt()
                .minusMinutes(10)
                .format(DateTimeFormatter.ISO_DATE_TIME);

    }
    
    public String getTenMinutesBeforeEnd() {

        return getEndsAt()
                .minusMinutes(10)
                .format(DateTimeFormatter.ISO_DATE_TIME);

    }

    public String getTwoHoursAfterEnd() {

        return getEndsAt()
                .plusHours(2)
                .format(DateTimeFormatter.ISO_DATE_TIME);

    }
    
}