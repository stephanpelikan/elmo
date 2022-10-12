package at.elmo.reservation;

import at.elmo.car.Car;
import at.elmo.util.spring.PersistenceBase;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorType;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "ELMO_RESERVATION")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "TYPE", discriminatorType = DiscriminatorType.STRING)
public abstract class ReservationBase extends PersistenceBase<String> {

    @Id
    @Column(name = "ID")
    private String id;

    @Column(name = "CANCELLED")
    private boolean cancelled;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime updatedAt;

    @Column(name = "STARTS_AT", nullable = false, updatable = false, columnDefinition = "TIMESTAMP")
    private LocalDateTime startsAt;

    @Column(name = "ENDS_AT", nullable = false, updatable = false, columnDefinition = "TIMESTAMP")
    private LocalDateTime endsAt;

    @ManyToOne()
    @JoinColumn(name = "CAR", referencedColumnName = "ID")
    private Car car;

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

    public Date getStartsAtDate() {

        return Date.from(getStartsAt()
                .atZone(ZoneId.systemDefault())
                .toInstant());

    }

    public Date getEndsAtDate() {

        return Date.from(getEndsAt()
                .atZone(ZoneId.systemDefault())
                .toInstant());

    }

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getStartsAt() {
        return startsAt;
    }

    public void setStartsAt(LocalDateTime startsAt) {
        this.startsAt = startsAt;
    }

    public LocalDateTime getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(LocalDateTime endsAt) {
        this.endsAt = endsAt;
    }

    public Car getCar() {
        return car;
    }

    public void setCar(Car car) {
        this.car = car;
    }

    public boolean isCancelled() {
        return cancelled;
    }

    public void setCancelled(boolean cancelled) {
        this.cancelled = cancelled;
    }

}
