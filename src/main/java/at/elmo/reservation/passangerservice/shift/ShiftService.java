package at.elmo.reservation.passangerservice.shift;

import at.elmo.car.Car;
import at.elmo.reservation.ReservationService;
import io.vanillabp.spi.process.ProcessService;
import io.vanillabp.spi.service.BpmnProcess;
import io.vanillabp.spi.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@WorkflowService(
        workflowAggregateClass = Shift.class,
        bpmnProcess = @BpmnProcess(bpmnProcessId = "ShiftLifecycle"))
@Transactional
public class ShiftService {

    @Autowired
    private ShiftRepository shifts;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private ProcessService<Shift> processService;

    public List<Shift> getShifts(){
        return shifts.findAll();
    }

    public List<Shift> getShifts(
            final LocalDateTime startsAt,
            final LocalDateTime endsAt) {
        
        return shifts.findInPeriod(startsAt, endsAt);

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

        final var overlappings = reservationService
                .checkForOverlappings(car, startsAt, endsAt);
        if (!overlappings.isEmpty()) {
            throw new Exception(
                    "Cannot create shift at "
                    + startsAt
                    + " -> "
                    + endsAt
                    + " due to existing overlapping reservations: "
                    + overlappings.stream().collect(Collectors.joining(", ")));
        }

        final var nextReservation = reservationService
                .getReservationByStartsAt(car, endsAt);
        final var previousReservation = reservationService
                .getReservationByEndsAt(car, startsAt);

        final var newShift = new Shift();
        newShift.setId(UUID.randomUUID().toString());
        newShift.setCar(car);
        newShift.setStartsAt(startsAt);
        newShift.setEndsAt(endsAt);
        newShift.setNextReservation(nextReservation);
        newShift.setPreviousReservation(previousReservation);

        final var shift = processService.startWorkflow(newShift);
        
        if (nextReservation != null) {
            nextReservation.setPreviousReservation(shift);
        }
        if (previousReservation != null) {
            previousReservation.setNextReservation(shift);
        }
        
        return shift;

    }

}
