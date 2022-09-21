package at.elmo.reservation.shift;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, String> {

    int countByCar_Id(String carId);

}
