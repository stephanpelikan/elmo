package at.elmo.reservation.passangerservice.shift;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, String> {

    int countByCar_Id(String carId);

    @Query("SELECT s.id FROM Shift s WHERE "
            + "(s.startsAt < ?1 AND s.endsAt > ?2)"
            + "OR (s.startsAt < ?1 AND s.endsAt > ?1)"
            + "OR (s.startsAt < ?2 AND s.endsAt > ?2)"
            + "OR (s.startsAt > ?1 AND s.endsAt < ?2)")
    List<String> findOverlappingShiftsIds(
            final LocalDateTime startsAt,
            final LocalDateTime endsAt);

}