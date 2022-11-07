package at.elmo.reservation.carsharing;

import at.elmo.reservation.carsharing.CarSharing.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface CarSharingRepository extends JpaRepository<CarSharing, String> {

    long countByStatusAndStartsAtGreaterThanEqualAndDriver_Id(Status status, LocalDateTime startsAt, String driverId);
    
    List<CarSharing> findByDriver_IdAndStatusNotInOrderByStartsAtAsc(String driverId, Collection<Status> status);
    
    Page<CarSharing> findByDriver_IdOrderByStartsAtAsc(String driverId, Pageable page);
    
}
