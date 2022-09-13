package at.elmo.reservation;

import at.elmo.member.Member;
import at.elmo.member.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationBase, String> {

}
