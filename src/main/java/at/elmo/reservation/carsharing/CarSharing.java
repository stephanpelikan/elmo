package at.elmo.reservation.carsharing;

import at.elmo.member.Member;
import at.elmo.reservation.ReservationBase;

import java.time.ZoneId;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;


@Entity
@DiscriminatorValue("CS")
public class CarSharing extends ReservationBase {

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

    public Date getFifteenMinutesBeforeStart() {

        return Date.from(getStartsAt()
                .minusMinutes(15)
                .atZone(ZoneId.systemDefault())
                .toInstant());

    }

    public Date getTwoHoursAfterEnd() {

        return Date.from(getEndsAt()
                .plusHours(2)
                .atZone(ZoneId.systemDefault())
                .toInstant());

    }

}