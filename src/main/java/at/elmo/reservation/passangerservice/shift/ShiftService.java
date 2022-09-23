package at.elmo.reservation.passangerservice.shift;

import at.elmo.car.Car;
import at.elmo.reservation.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ShiftService {

    @Autowired
    private ShiftRepository shifts;

    @Autowired
    private ShiftLifecycle shiftLifecycle;

    @Autowired
    private ReservationService reservationService;

    public List<Shift> getShifts(){
        return shifts.findAll();
    }

    public boolean hasShifts(
            final String carId) {

        return shifts.countByCar_Id(carId) > 0;

    }

    public Shift createShift(
            final Car car,
            final LocalDate day,
            final ShiftProperties properties) throws Exception {

        final var startsAt = day.atTime(LocalTime.parse(properties.getStart()));
        final var endsAt = day.atTime(LocalTime.parse(properties.getEnd()));

        reservationService.checkForOverlappings(startsAt, endsAt);

        final var shift = new Shift();
        shift.setId(UUID.randomUUID().toString());
        shift.setCar(car);
        shift.setStartsAt(startsAt);
        shift.setEndsAt(endsAt);

        return shiftLifecycle.createShift(shift);

    }

}
