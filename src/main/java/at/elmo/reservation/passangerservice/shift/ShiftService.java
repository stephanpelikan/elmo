package at.elmo.reservation.passangerservice.shift;

import at.elmo.car.Car;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
            final LocalDate day,
            final ShiftProperties properties) throws Exception {

        final var startsAt = day.atTime(LocalTime.parse(properties.getStart()));
        final var endsAt = day.atTime(LocalTime.parse(properties.getEnd()));
        
        final var overlapping = shifts.findOverlappingShiftsIds(startsAt, endsAt);
        if (!overlapping.isEmpty()) {
            
            throw new Exception(
                    "Cannot create shift at "
                    + startsAt
                    + " -> "
                    + endsAt
                    + " due to existing overlapping shifts: "
                    + overlapping.stream().collect(Collectors.joining(", ")));
            
        }
        
        final var shift = new Shift();
        shift.setId(UUID.randomUUID().toString());
        shift.setCar(car);
        shift.setStartsAt(startsAt);
        shift.setEndsAt(endsAt);
        shiftLifecycle.createShift(shift);

    }

}
