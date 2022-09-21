package at.elmo.reservation.shift;

import at.elmo.car.Car;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ShiftService {

    @Autowired
    private ShiftRepository shifts;

    @Autowired
    private ShiftLifecycle shiftLifecycle;

    public List<Shift> getShifts(){
        return shifts.findAll();
    }
    
    public boolean hasShifts(
            final String carId) {
        
        return shifts.countByCar_Id(carId) > 0;
        
    }

    public void createShift(
            final Car car,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt) throws Exception {

        final var shift = new Shift();
        shift.setId(UUID.randomUUID().toString());
        shift.setCar(car);
        shift.setStartsAt(startsAt);
        shift.setEndsAt(endsAt);
        shiftLifecycle.createShift(shift);

    }

}
