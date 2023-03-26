package at.elmo.reservation.passangerservice.shift;

import at.elmo.car.Car;
import at.elmo.config.ElmoProperties;
import at.elmo.member.Member;
import at.elmo.member.MemberRepository;
import at.elmo.reservation.ReservationNotification;
import at.elmo.reservation.ReservationService;
import at.elmo.reservation.passangerservice.shift.exceptions.UnknownShiftException;
import at.elmo.util.email.NamedObject;
import at.elmo.util.sms.SmsService;
import io.vanillabp.spi.process.ProcessService;
import io.vanillabp.spi.service.BpmnProcess;
import io.vanillabp.spi.service.WorkflowService;
import io.vanillabp.spi.service.WorkflowTask;
import org.apache.commons.lang3.NotImplementedException;
import org.slf4j.Logger;
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
        bpmnProcess = @BpmnProcess(bpmnProcessId = "ShiftLifecycle"),
        secondaryBpmnProcesses = {
                @BpmnProcess(bpmnProcessId = "PassangerService"),
                @BpmnProcess(bpmnProcessId = "ShiftDue"),
                @BpmnProcess(bpmnProcessId = "ShiftSwapOfDriverNeeded"),
                @BpmnProcess(bpmnProcessId = "ShiftSwapOfDriverRequested"),
                @BpmnProcess(bpmnProcessId = "WaitForStartOfShift")
        })
@Transactional
public class ShiftService {

    @Autowired
    private Logger logger;
    
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Autowired
    private ShiftRepository shifts;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private ProcessService<Shift> processService;
    
    @Autowired
    private ElmoProperties properties;

    @Autowired
    private SmsService smsService;

    @Autowired
    private MemberRepository members;
    
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
        
        processService.correlateMessage(shift, "ShiftClaimed");
        
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
        
        processService.correlateMessage(shift, "ShiftUnclaimed");
        
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
    
    @WorkflowTask
    public void informPassangerAboutShiftNotClaimedYet() {
        
        throw new NotImplementedException();
        
    }
    
    @WorkflowTask
    public void informPassangerAboutShiftCancellation() {
        
        throw new NotImplementedException();
        
    }
    
    @WorkflowTask
    public void informDriversAboutSwapNeeded(
            final Shift shift) {

        members
                .findActiveDrivers()
                .forEach(driver -> sendDriverSms(
                        driver,
                        shift,
                        "passanger-service/inform-driver-about-swap-needed",
                        "informDriversAboutSwapNeeded"));
        
    }
    
    private void sendDriverSms(
            final Member driver,
            final Shift shift,
            final String template,
            final String fromMethod) {

        try {
            smsService.sendSms(
                    template,
                    ShiftService.class.getSimpleName() + "#" + fromMethod,
                    properties.getPassanagerServicePhoneNumber(),
                    driver.getMemberId().toString(),
                    driver.getPhoneNumber(),
                    NamedObject.from(shift).as("shift"),
                    NamedObject.from(driver).as("recipient"));
        } catch (Exception e) {
            logger.warn(
                    "Could not send SMS '{}' to {}!",
                    fromMethod,
                    driver.getMemberId(),
                    e);
        }
        
    }
    
    @WorkflowTask
    public void informDriverAboutRequestForSwap(
            final Shift shift) {
        
        sendDriverSms(
                shift.getDriver(),
                shift,
                "passanger-service/inform-driver-about-swap-requested",
                "informDriverAboutRequestForSwap");

    }
    
    @WorkflowTask
    public void informDriversAboutSwapDone(
            final Shift shift) {
        
        members
                .findActiveDrivers()
                .forEach(driver -> sendDriverSms(
                        driver,
                        shift,
                        "passanger-service/inform-driver-about-swap-done",
                        "informDriversAboutSwapDone"));
        
    }
    
    @WorkflowTask
    public void unclaimShiftDueToFailedSwap(
            final Shift shift) throws UnknownShiftException {
        
        unclaimShift(
                shift.getId(),
                shift.getDriver());
        
    }
    
    @WorkflowTask
    public void informDriverAboutSwapRejected(
            final Shift shift) {
        
        sendDriverSms(
                shift.getDriver(),
                shift,
                "passanger-service/inform-driver-about-swap-was-rejected",
                "informDriverAboutSwapRejected");
        
        shift.setDriverRequestingSwap(null);
        
    }
    
    @WorkflowTask
    public void informDriversAboutSwapCancelled(
            final Shift shift) {
        
        members
                .findActiveDrivers()
                .forEach(driver -> sendDriverSms(
                        driver,
                        shift,
                        "passanger-service/inform-driver-about-swap-cancelled",
                        "informDriversAboutSwapCancelled"));
        
    }
    
    @WorkflowTask
    public void informDriverAboutCancellationOfSwap(
            final Shift shift) {
        
        sendDriverSms(
                shift.getDriver(),
                shift,
                "passanger-service/inform-driver-about-cancellation-of-swap",
                "informDriverAboutCancellationOfSwap");
        
        shift.setDriverRequestingSwap(null);
        
    }

    @WorkflowTask
    public void informDriverAboutSwapAccepted(
            final Shift shift) {
        
        sendDriverSms(
                shift.getDriver(),
                shift,
                "passanger-service/inform-driver-about-swap-was-accepted",
                "informDriverAboutSwapAccepted");
        
        shift.setDriver(
                shift.getDriverRequestingSwap());
        shift.setDriverRequestingSwap(null);
        
    }

    @WorkflowTask
    public void askDriversToClaimShift(
        final Shift shift) {
        
        members
                .findActiveDrivers()
                .forEach(driver -> sendDriverSms(
                        driver,
                        shift,
                        "passanger-service/as-driver-to-claim-shift",
                        "askDriversToClaimShift"));
        
    }
    
    @WorkflowTask
    public void asDriverBeforeCancellationToClaimShift(
        final Shift shift) {
        
        members
                .findActiveDrivers()
                .forEach(driver -> sendDriverSms(
                        driver,
                        shift,
                        "passanger-service/as-driver-before-cancellation-to-claim-shift",
                        "asDriverBeforeCancellationToClaimShift"));
        
    }
    
    @WorkflowTask
    public void markReservationAsConditionally() {
        
        throw new NotImplementedException();
        
    }
    
    @WorkflowTask
    public void informPassangerAboutTurnedIntoConditionallyReservation() {
        
        throw new NotImplementedException();
        
    }
    
    @WorkflowTask
    public void informPassangerAboutTurnedIntoSteadyReservation() {
        
        throw new NotImplementedException();
        
    }
    
    @WorkflowTask
    public void markReservationAsSteady() {
        
        throw new NotImplementedException();
        
    }

}
