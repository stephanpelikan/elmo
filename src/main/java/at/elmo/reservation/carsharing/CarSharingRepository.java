package at.elmo.reservation.carsharing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarSharingRepository extends JpaRepository<CarSharing, String> {

}
