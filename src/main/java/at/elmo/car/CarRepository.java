package at.elmo.car;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarRepository extends JpaRepository<Car, String> {

    Optional<Car> findByShortcut(String shortcut);

    long countByPassengerService(boolean passengerService);
    
    List<Car> findByPassengerService(boolean passengerService);

    List<Car> findByCarSharing(boolean carSharing);

}
