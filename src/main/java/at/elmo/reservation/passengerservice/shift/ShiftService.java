package at.elmo.reservation.passengerservice.shift;

import static at.elmo.reservation.passengerservice.shift.Shift.Status.*;
import at.elmo.car.Car;
import at.elmo.car.CarService;
import at.elmo.config.ElmoProperties;
import at.elmo.member.Member;
import at.elmo.member.Member.Status;
import at.elmo.member.MemberRepository;
import at.elmo.member.Role;
import at.elmo.reservation.ReservationNotification;
import at.elmo.reservation.ReservationService;
import at.elmo.reservation.passengerservice.shift.exceptions.UnknownShiftException;
import at.elmo.reservation.passengerservice.shift.overview.ShiftOverviewHour;
import at.elmo.reservation.passengerservice.shift.overview.ShiftStatus;
import at.elmo.util.email.EmailService;
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

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@WorkflowService(
        workflowAggregateClass = Shift.class,
        bpmnProcess = @BpmnProcess(bpmnProcessId = "ShiftLifecycle"),
        secondaryBpmnProcesses = {
                @BpmnProcess(bpmnProcessId = "PassengerService"),
                @BpmnProcess(bpmnProcessId = "ShiftDue"),
                @BpmnProcess(bpmnProcessId = "ShiftSwapOfDriverNeeded"),
                @BpmnProcess(bpmnProcessId = "ShiftSwapOfDriverRequested"),
                @BpmnProcess(bpmnProcessId = "WaitForStartOfShift"),
                @BpmnProcess(bpmnProcessId = "ShiftClaimReminder")
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
    private CarService carService;

    @Autowired
    private SmsService smsService;
    
    @Autowired
    private EmailService emailService;

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
        shift.setStatus(CLAIMED);
        
        final var driverRequestingSwap = shift.getDriverRequestingSwap();
        shift.setDriverRequestingSwap(null);
        
        if (driverRequestingSwap != null) {
            processService.correlateMessage(
                    shift,
                    "ShiftReclaimed");
        } else {
            processService.correlateMessage(
                    shift,
                    "ShiftClaimed");
        }
        
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

        shift.setDriverRequestingSwap(currentDriver);
        shift.setDriver(null);
        shift.setStatus(UNCLAIMED);

        processService.correlateMessage(
                shift,
                "ShiftUnclaimed");
        
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
        newShift.setStatus(UNCLAIMED);

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
    public void informPassengerAboutShiftNotClaimedYet() {
        
        throw new NotImplementedException();
        
    }
    
    @WorkflowTask
    public void informPassengerAboutShiftCancellation() {
        
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
                        "passenger-service/inform-driver-about-swap-needed",
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
                "passenger-service/inform-driver-about-swap-requested",
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
                        "passenger-service/inform-driver-about-swap-done",
                        "informDriversAboutSwapDone"));
        
    }
    
    @WorkflowTask
    public void informDriverAboutSwapRejected(
            final Shift shift) {
        
        sendDriverSms(
                shift.getDriver(),
                shift,
                "passenger-service/inform-driver-about-swap-was-rejected",
                "informDriverAboutSwapRejected");
        
        shift.setDriverRequestingSwap(null);
        
    }
    
    @WorkflowTask
    public void informDriverAboutCancellationOfSwap(
            final Shift shift) {
        
        sendDriverSms(
                shift.getDriver(),
                shift,
                "passenger-service/inform-driver-about-cancellation-of-swap",
                "informDriverAboutCancellationOfSwap");
        
        shift.setDriverRequestingSwap(null);
        
    }

    @WorkflowTask
    public void informDriverAboutSwapAccepted(
            final Shift shift) {
        
        sendDriverSms(
                shift.getDriver(),
                shift,
                "passenger-service/inform-driver-about-swap-was-accepted",
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
                        "passenger-service/ask-driver-to-claim-shift",
                        "askDriversToClaimShift"));
        
    }
    
    public static int mapKeyOfHour(
            final LocalDateTime startOfOverview,
            final LocalDateTime hour) {
        
        return (hour.getYear() - startOfOverview.getYear()) * 366 * 24
                + hour.getDayOfYear() * 24
                + hour.getHour();
        
    }
    
    @WorkflowTask
    public void askDriversToClaimAnyFreeShiftOfNextWeek() throws Exception {
        
        final var now = LocalDateTime.now();
        
        final var startOfOverview = now
                .truncatedTo(ChronoUnit.DAYS)
                .minusDays(now.getDayOfWeek().getValue() - 1)
                .plusWeeks(1);
        final var endOfOverview = startOfOverview
                .plusWeeks(1);

        final var numberOfCars = carService.getCountOfPassengerServiceCars();

        final var carCounters = new HashMap<Integer, Integer>();
        final var cars = new HashMap<Integer, Car>();
        final var shifts = new HashMap<Integer, Shift>();
        
        final var unclaimedShifts = new int[] { 0 };
        getShifts(
                startOfOverview,
                endOfOverview)
                .forEach(shift -> {
                        shifts.put(
                                mapKeyOfHour(startOfOverview, shift.getStartsAt()),
                                shift);
                        if (shift.getDriver() == null) {
                            ++unclaimedShifts[0];
                        }
                        
                        for (LocalDateTime hour = shift.getStartsAt()
                                ; !hour.equals(shift.getEndsAt())
                                ; hour = hour.plusHours(1)) {
                            
                            final var mapKeyOfHour = mapKeyOfHour(startOfOverview, hour);
                            
                            var counter = carCounters.getOrDefault(mapKeyOfHour, 0);
                            if (shift.getDriver() != null) {
                                counter += 1;
                            }
                            carCounters.put(mapKeyOfHour, counter);
                            
                            if (!cars.containsKey(mapKeyOfHour)) {
                                cars.put(mapKeyOfHour, shift.getCar());
                            }
                            
                        }
                });
        
        if (unclaimedShifts[0] == 0) {
            logger.info("All shifts are claimed by drivers - no reminder needs to be sent!");
            return;
        }
        
        final var startOfOverviewDay = startOfOverview
                .truncatedTo(ChronoUnit.DAYS);
        final var endOfOverviewDay = endOfOverview
                .truncatedTo(ChronoUnit.DAYS);
        final var daysInPeriod = Duration
                .between(startOfOverviewDay, endOfOverviewDay)
                .toDays();

        final var days = new LinkedList<LocalDateTime>();
        for (int day = 0; day < daysInPeriod; ++day) {
            days.add(startOfOverviewDay.plusDays(day));
        }
        
        final var hours = new LinkedHashMap<Integer, List<ShiftOverviewHour>>();

        var hasPartials = false;
        final var lastShifts = new HashMap<Integer, ShiftOverviewHour>();
        for (int hour = 0; hour < 24; ++hour) {

            final var overviewDays = new LinkedList<ShiftOverviewHour>();
            hours.put(hour, overviewDays);
            
            for (int day = 0; day < daysInPeriod; ++day) {
                
                final var lastShift = lastShifts.get(day);
                
                final var currentHour = startOfOverviewDay
                        .plusDays(day)
                        .plusHours(hour);
                
                final var mapKeyOfHour = mapKeyOfHour(startOfOverview, currentHour);

                final var shift = shifts.get(mapKeyOfHour);
                if (shift != null) {

                    final var shiftHour = new ShiftOverviewHour();
                    shiftHour.setStartsAt(shift.getStartsAt());
                    shiftHour.setEndsAt(shift.getEndsAt());
                    shiftHour.setDurationInHours(
                            (int) Duration
                                    .between(shift.getStartsAt(), shift.getEndsAt())
                                    .toHours());
                    shiftHour.setDescription(Integer.toString(currentHour.getHour()));
                    overviewDays.add(shiftHour);
                    lastShifts.put(day, shiftHour);

                    final var carCounter = carCounters.getOrDefault(mapKeyOfHour, -1);
                    if (carCounter == 0) {
                        shiftHour.setStatus(ShiftStatus.FREE);
                    } else if (carCounter == numberOfCars) {
                        shiftHour.setStatus(ShiftStatus.COMPLETE);
                    } else {
                        shiftHour.setStatus(ShiftStatus.PARTIAL);
                        hasPartials = true;
                    }
                
                    final var car = cars.get(mapKeyOfHour);
                    if (car != null) {
                        shiftHour.setCarId(car.getId());
                    }
                    
                } else if ((lastShift == null)
                        || !lastShift.getEndsAt().isAfter(currentHour)) {
                    
                    final var noShift = new ShiftOverviewHour();
                    noShift.setStatus(ShiftStatus.NO_SHIFT);
                    overviewDays.add(noShift);
                    
                } else {
                    
                    overviewDays.add(null);
                    
                }

            }
            
        }
        
        final var includesPartials = new boolean[] { hasPartials };
        members
                .findByStatusAndRoles_Role(Status.ACTIVE, Role.DRIVER)
                .forEach(driver -> {
                    try {
                        emailService.sendEmail(
                                "passenger-service/ask-drivers-to-claim-any-free-shift-of-next-week",
                                driver.getEmail(),
                                NamedObject.from(hours).as("hours"),
                                NamedObject.from(days).as("days"),
                                NamedObject.from(includesPartials[0]).as("hasPartials"),
                                NamedObject.from(driver).as("driver"));
                    } catch (Exception e) {
                        logger.warn(
                                "Could not send email '{}' to {}!",
                                "askDriversToClaimAnyFreeShiftOfNextWeek",
                                driver.getMemberId(),
                                e);
                    }
                });

    }
        
    @WorkflowTask
    public void askDriverBeforeCancellationToClaimShift(
            final Shift shift) {
        
        members
                .findActiveDrivers()
                .forEach(driver -> sendDriverSms(
                        driver,
                        shift,
                        "passenger-service/ask-driver-before-cancellation-to-claim-shift",
                        "askDriverBeforeCancellationToClaimShift"));
        
    }

    @WorkflowTask
    public void shiftInProgress(
            final Shift shift) {

        shift.setStatus(IN_PROGRESS);
        
    }
    
    @WorkflowTask
    public void shiftDone(
            final Shift shift) {

        shift.setStatus(DONE);
        
    }
    
    @WorkflowTask
    public void shiftCancelled(
            final Shift shift) {

        shift.setStatus(CANCELLED);
        
    }
    
    @WorkflowTask
    public void informPassengerAboutTurnedIntoConditionallyReservation() {
        
        throw new NotImplementedException();
        
    }
    
    @WorkflowTask
    public void informPassengerAboutTurnedIntoSteadyReservation() {
        
        throw new NotImplementedException();
        
    }

}
