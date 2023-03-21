package at.elmo.reservation.passangerservice.shift;

import at.elmo.car.Car;
import at.elmo.config.db.DbNotification;
import at.elmo.member.Member;
import at.elmo.reservation.ReservationBase;
import at.elmo.reservation.ReservationNotification;
import at.elmo.reservation.ReservationService;
import at.elmo.reservation.passangerservice.shift.exceptions.UnknownShiftException;
import io.vanillabp.spi.process.ProcessService;
import io.vanillabp.spi.service.BpmnProcess;
import io.vanillabp.spi.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
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
    private ApplicationEventPublisher applicationEventPublisher;

    @Autowired
    private ShiftRepository shifts;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private ProcessService<Shift> processService;

    @Async
    @EventListener(
            classes = ReservationNotification.class,
            condition = "#notification.reservationType == '" + Shift.TYPE + "'")
    public void processShiftUpdates(
            final ReservationNotification notification) throws Exception {
        
        applicationEventPublisher
                .publishEvent(new ShiftChangedNotification(
                        notification.getType(),
                        notification.getId()));
        
    }

    public boolean claimShift(
            final String shiftId,
            final Member driver) throws UnknownShiftException {
        
        final var shiftFound = shifts.findById(shiftId);
        if (shiftFound.isEmpty()) {
            throw new UnknownShiftException();
        }
        
        final var shift = shiftFound.get();
        
        if (shift.isCancelled()) {
            throw new UnknownShiftException();
        }
        final var currentDriver = shift.getDriver();
        if ((currentDriver != null)
                && !currentDriver.equals(driver)) {
            return false;
        }
        
        shift.setDriver(driver);
        
        return true;
        
    }

    public boolean unclaimShift(
            final String shiftId,
            final Member driver) throws UnknownShiftException {
        
        final var shiftFound = shifts.findById(shiftId);
        if (shiftFound.isEmpty()) {
            throw new UnknownShiftException();
        }
        
        final var shift = shiftFound.get();
        
        if (shift.isCancelled()) {
            throw new UnknownShiftException();
        }
        final var currentDriver = shift.getDriver();
        if ((currentDriver == null)
                || !currentDriver.equals(driver)) {
            return false;
        }
        
        shift.setDriver(null);
        
        return true;
        
    }

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
