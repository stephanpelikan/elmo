package at.elmo.reservation;

import at.elmo.car.Car;
import at.elmo.member.Member;
import at.elmo.reservation.history.DriverConsumptionPerYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationBase, String> {

    @Query("SELECT r.id FROM ReservationBase r WHERE "
            + "(r.car = ?3) "
            + "AND (r.cancelled = false) "
            + "AND ((r.startsAt >= ?1 AND r.endsAt <= ?2) " // inner or equal overlapping
            + "OR (r.startsAt < ?1 AND r.endsAt > ?2) "     // total outer overlapping
            + "OR (r.startsAt <= ?1 AND r.endsAt > ?1) "    // left overlapping (inner and outer)
            + "OR (r.startsAt < ?2 AND r.endsAt >= ?2))")   // right overlapping (inner and outer)
    List<String> findOverlappingReservationsIds(LocalDateTime startsAt, LocalDateTime endsAt, Car car);

    @Query("SELECT r FROM ReservationBase r WHERE "
            + "(r.cancelled = false) "
            + "AND ((r.startsAt <= ?1 AND r.endsAt >= ?2) " // total outer or equal overlapping
            + "OR (r.startsAt <= ?1 AND r.endsAt > ?1) "    // left overlapping (inner and outer)
            + "OR (r.startsAt < ?2 AND r.endsAt >= ?2) "    // right overlapping (inner and outer)
            + "OR (r.startsAt > ?1 AND r.endsAt < ?2))"     // inner overlapping
            + "ORDER BY r.startsAt")
    List<ReservationBase> findInPeriod(LocalDateTime startsAt, LocalDateTime endsAt);

    Optional<ReservationBase> findByCarAndStartsAtAndCancelled(Car car, LocalDateTime startsAt, boolean cancelled);
    
    Optional<ReservationBase> findByCarAndEndsAtAndCancelled(Car car, LocalDateTime endsAt, boolean cancelled);
    
    @Query("SELECT YEAR(r.startsAt) AS year, SUM(r.usageMinutes) AS minutes, r.type AS type FROM ConsumingReservation r WHERE "
            + "(NOT r.usageMinutes IS NULL) "
            + "AND (r.driver = ?1) "
            + "AND r.cancelled = false "
            + "GROUP BY year, type "
            + "ORDER BY year")
    List<DriverConsumptionPerYear> aggregateConsumptionByDriver(Member driver);
    
}
