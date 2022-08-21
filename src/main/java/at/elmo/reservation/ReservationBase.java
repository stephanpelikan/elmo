package at.elmo.reservation;

import at.elmo.car.Car;
import at.elmo.member.Member;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorType;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@Table(name = "ELMO_RESERVATION")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "TYPE", discriminatorType = DiscriminatorType.STRING)
public abstract class ReservationBase {

    @Id
    @Column(name = "ID")
    private String id;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    @Column(name = "STARTS_AT", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime startsAt;

    @Column(name = "ENDS_AT", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime endsAt;

    @ManyToOne()
    @JoinColumn(name = "CAR", referencedColumnName = "ID")
    private Car car;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
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

    public Car getCar() {return car;}

    public void setCar(Car car) {this.car = car;}
}
