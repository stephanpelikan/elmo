package at.elmo.reservation.blocking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlockingRepository extends JpaRepository<BlockingReservation, String> {

}
