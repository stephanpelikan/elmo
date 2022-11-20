package at.elmo.reservation;

import at.elmo.car.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationBase, String> {

    @Query("SELECT r.id FROM ReservationBase r WHERE "
            + "(r.car = ?3) "
            + "AND (r.cancelled = false) "
            + "AND ((r.startsAt >= ?1 AND r.endsAt <= ?2) "
            + "OR (r.startsAt < ?1 AND r.endsAt > ?2) "
            + "OR (r.startsAt <= ?1 AND r.endsAt > ?1) "
            + "OR (r.startsAt < ?2 AND r.endsAt >= ?2))")
    List<String> findOverlappingReservationsIds(LocalDateTime startsAt, LocalDateTime endsAt, Car car);

    @Query("SELECT r FROM ReservationBase r WHERE "
            + "(r.cancelled = false) "
            + "AND ((r.startsAt <= ?1 AND r.endsAt >= ?2) "
            + "OR (r.startsAt <= ?1 AND r.endsAt > ?1) "
            + "OR (r.startsAt < ?2 AND r.endsAt >= ?2) "
            + "OR (r.startsAt > ?1 AND r.endsAt < ?2))"
            + "ORDER BY r.startsAt")
    List<ReservationBase> findInPeriod(LocalDateTime startsAt, LocalDateTime endsAt);

}
