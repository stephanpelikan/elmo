package at.elmo.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationBase, String> {

    @Query("SELECT r.id FROM ReservationBase r WHERE "
            + "(r.startsAt < ?1 AND r.endsAt > ?2)"
            + "OR (r.startsAt < ?1 AND r.endsAt > ?1)"
            + "OR (r.startsAt < ?2 AND r.endsAt > ?2)"
            + "OR (r.startsAt > ?1 AND r.endsAt < ?2)")
    List<String> findOverlappingReservationsIds(
            final LocalDateTime startsAt,
            final LocalDateTime endsAt);

}
