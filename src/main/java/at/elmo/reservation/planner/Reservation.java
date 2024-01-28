package at.elmo.reservation.planner;

import at.elmo.car.Car;
import at.elmo.reservation.ReservationBase;

import java.time.LocalDateTime;

public interface Reservation {
    
    String getId();

    LocalDateTime getCreatedAt();

    LocalDateTime getUpdatedAt();

    LocalDateTime getStartsAt();

    LocalDateTime getEndsAt();

    Car getCar();

    boolean isCancelled();

    ReservationBase getNextReservation();

    ReservationBase getPreviousReservation();

    String getType();

}
