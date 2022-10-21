package at.elmo.reservation.carsharing;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import at.elmo.reservation.carsharing.CarSharing.Status;

@Repository
public interface CarSharingRepository extends JpaRepository<CarSharing, String> {

    long countByStatusAndStartsAtGreaterThanEqualAndDriver_Id(Status status, LocalDateTime startsAt, String driverId);
    
}
