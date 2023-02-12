package at.elmo.reservation.carsharing;

import at.elmo.car.Car;
import at.elmo.config.ElmoProperties;
import at.elmo.member.Member;
import at.elmo.member.MemberRepository;
import at.elmo.member.Role;
import at.elmo.reservation.ReservationNeighborChangedNotification;
import at.elmo.reservation.ReservationService;
import at.elmo.reservation.blocking.BlockingReservation;
import at.elmo.reservation.carsharing.CarSharing.Status;
import at.elmo.reservation.passangerservice.shift.Shift;
import at.elmo.util.email.EmailService;
import at.elmo.util.email.NamedObject;
import at.elmo.util.exceptions.ElmoException;
import at.elmo.util.sms.SmsService;
import io.vanillabp.spi.process.ProcessService;
import io.vanillabp.spi.service.BpmnProcess;
import io.vanillabp.spi.service.TaskEvent;
import io.vanillabp.spi.service.TaskEvent.Event;
import io.vanillabp.spi.service.TaskId;
import io.vanillabp.spi.service.WorkflowService;
import io.vanillabp.spi.service.WorkflowTask;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@WorkflowService(
        workflowAggregateClass = CarSharing.class,
        bpmnProcess = { @BpmnProcess(bpmnProcessId = "CarSharingLifecycle") })
@Transactional
public class CarSharingService {

    @Autowired
    private Logger logger;
    
    @Autowired
    private CarSharingRepository carSharings;
    
    @Autowired
    private MemberRepository members;

    @Autowired
    private ProcessService<CarSharing> processService;
    
    @Autowired
    private SmsService smsService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private ElmoProperties properties;
    
    @Autowired
    private ReservationService reservationService;
    
    @EventListener(classes = ReservationNeighborChangedNotification.class)
    public void processChangeOfNeighbor(
            final ReservationNeighborChangedNotification notification) {
        
        if (notification.isPreviousChanged()) {
            return;
        }
        
        final var carSharingFound = carSharings.findById(notification.getId());
        if (carSharingFound.isEmpty()) {
            return;
        }
        
        final var carSharing = carSharingFound.get();
        
        if ((notification.getOldNeighborReservationId() == null)
                && (notification.getNewNeighborReservationId() != null)) {
            processService.correlateMessage(
                    carSharing,
                    "CarReservedDirectlyAfterwards");
        }
        
    }
    
    public long numberOfFutureCarSharings(
            final Member driver) {

        return carSharings.countByStatusAndStartsAtGreaterThanEqualAndDriver_Id(
                Status.RESERVED,
                LocalDateTime.now(),
                driver.getId());

    }
    
    public List<CarSharing> getOutstandingReservations(
            final Member driver) {
        
        return carSharings.findByDriver_IdAndStatusNotInOrderByStartsAtAsc(
                driver.getId(),
                List.of(Status.COMPLETED, Status.CANCELLED));
        
    }
    
    public CarSharing createCarSharing(
            final Car car,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt,
            final Member driver) throws Exception {
        
        final var nextReservation = reservationService
                .getReservationByStartsAt(car, endsAt);
        final var previousReservation = reservationService
                .getReservationByEndsAt(car, startsAt);
        
        final var newCarSharing = new CarSharing();
        newCarSharing.setId(UUID.randomUUID().toString());
        newCarSharing.setCar(car);
        newCarSharing.setDriver(driver);
        newCarSharing.setStartsAt(startsAt);
        newCarSharing.setEndsAt(endsAt);
        newCarSharing.setStatus(Status.RESERVED);
        newCarSharing.setHoursPlanned(newCarSharing.getHours());
        newCarSharing.setNextReservation(nextReservation);
        newCarSharing.setPreviousReservation(previousReservation);

        final var newHours = driver
                .getHoursConsumedCarSharing()
                + newCarSharing.getHoursPlanned();
        members
                .getReferenceById(driver.getId())
                .setHoursConsumedCarSharing(newHours);

        final var carSharing = processService.startWorkflow(newCarSharing);
        
        if (nextReservation != null) {
            nextReservation.setPreviousReservation(carSharing);
        }
        if (previousReservation != null) {
            previousReservation.setNextReservation(carSharing);
        }
        
        return carSharing;

    }
    
    public boolean cancelCarSharingDueToConflict(
            final CarSharing carSharing) {
        
        if (carSharing.getPreviousReservation() != null) {
            carSharing.getPreviousReservation().setNextReservation(null);
            carSharing.setPreviousReservation(null);
        }
        if (carSharing.getNextReservation() != null) {
            carSharing.getNextReservation().setPreviousReservation(null);
            carSharing.setNextReservation(null);
        }
        
        return cancelCarSharing(
                carSharing,
                null,
                "CancelledDueToConflict");
        
    }

    public boolean cancelCarSharingByDriver(
            final String reservationId) {
        
        return cancelCarSharingByUser(
                reservationId,
                null,
                "CancelledByDriver");
        
    }

    public boolean cancelCarSharingByAdministrator(
            final String reservationId,
            final String comment) {

        return cancelCarSharingByUser(
                reservationId,
                comment,
                "CancelledByAdministrator");
        
    }

    public boolean cancelCarSharingByUser(
            final String reservationId,
            final String comment,
            final String eventName) {
        
        final var carSharingFound = carSharings.findById(reservationId);
        if (carSharingFound.isEmpty()) {
            return false;
        }
        final var carSharing = carSharingFound.get();
        
        final var now = LocalDateTime.now();

        // car-sharing already started
        if (carSharing.getStartsAt().isBefore(now)) {
            
            final var endOfUsage = now
                    .truncatedTo(ChronoUnit.HOURS)
                    .plusHours(1);
            if (endOfUsage.isBefore(carSharing.getEndsAt())) {
                carSharing.setEndsAt(endOfUsage);
            }
            
            if (carSharing.getNextReservation() != null) {
                carSharing.getNextReservation().setPreviousReservation(null);
                carSharing.setNextReservation(null);
            }
            final var nextReservation = reservationService
                    .getReservationByStartsAt(carSharing.getCar(), endOfUsage);
            if (nextReservation != null) {
                carSharing.setNextReservation(nextReservation);
                nextReservation.setPreviousReservation(carSharing);
            }
            
        } else {
            
            if (carSharing.getPreviousReservation() != null) {
                carSharing.getPreviousReservation().setNextReservation(null);
                carSharing.setPreviousReservation(null);
            }
            if (carSharing.getNextReservation() != null) {
                carSharing.getNextReservation().setPreviousReservation(null);
                carSharing.setNextReservation(null);
            }
            
        }
        
        return cancelCarSharing(
                carSharing,
                comment,
                eventName);
        
    }

    private boolean cancelCarSharing(
            final CarSharing carSharing,
            final String comment,
            final String causingEvent) {
        
        if (comment != null) {
            carSharing.setComment(comment);
        }
        
        processService.correlateMessage(
                carSharing,
                causingEvent);
        
        return true;
        
    }
    
    @WorkflowTask
    public void remindDriverToConfirmStartOfUsage(
            final CarSharing carSharing) throws Exception {

        smsService.sendSms(
                "car-sharing/remind-driver-to-confirm-start-of-usage",
                CarSharingService.class.getSimpleName() + "#remindDriverToConfirmStartOfUsage",
                properties.getPassanagerServicePhoneNumber(),
                carSharing.getDriver().getMemberId().toString(),
                carSharing.getDriver().getPhoneNumber(),
                NamedObject.from(carSharing).as("carSharing"));

    }

    @WorkflowTask
    public void remindDriverToReturnCarInTime(
            final CarSharing carSharing) throws Exception {

        smsService.sendSms(
                "car-sharing/remind-driver-to-return-car-in-time",
                CarSharingService.class.getSimpleName() + "#remindDriverToReturnCarInTime",
                properties.getPassanagerServicePhoneNumber(),
                carSharing.getDriver().getMemberId().toString(),
                carSharing.getDriver().getPhoneNumber(),
                NamedObject.from(carSharing).as("carSharing"));

    }

    @WorkflowTask
    public void remindDriverToConfirmEndOfUsage(
            final CarSharing carSharing) throws Exception {

        smsService.sendSms(
                "car-sharing/remind-driver-to-confirm-end-of-usage",
                CarSharingService.class.getSimpleName() + "#remindDriverToConfirmEndOfUsage",
                properties.getPassanagerServicePhoneNumber(),
                carSharing.getDriver().getMemberId().toString(),
                carSharing.getDriver().getPhoneNumber(),
                NamedObject.from(carSharing).as("carSharing"));

    }

    @WorkflowTask
    @WorkflowTask(taskDefinition = "informDriverAboutCancellation")  // legacy
    public void informDriverAboutCancellationByAdministrator(
            final CarSharing carSharing) throws Exception {

        smsService.sendSms(
                "car-sharing/inform-driver-about-cancellation-by-administrator",
                CarSharingService.class.getSimpleName() + "#informDriverAboutCancellationByAdministrator",
                properties.getPassanagerServicePhoneNumber(),
                carSharing.getDriver().getMemberId().toString(),
                carSharing.getDriver().getPhoneNumber(),
                NamedObject.from(carSharing).as("carSharing"));

    }

    @WorkflowTask
    @WorkflowTask(taskDefinition = "informAboutUnconfirmedUsage")  // legacy
    public void informAdministratorAboutUnconfirmedUsage(
            final CarSharing carSharing) throws Exception {

        final var adminMembersEmailAddresses = members
                .findByRoles_Role(Role.ADMIN)
                .stream()
                .map(Member::getEmail)
                .collect(Collectors.toList());
        
        emailService.sendEmail(
                "car-sharing/inform-administrator-about-unconfirmed-usage",
                adminMembersEmailAddresses,
                NamedObject.from(carSharing).as("carSharing"));
        
    }
    
    @WorkflowTask
    public void informNextDriverAboutDelay(
            final CarSharing carSharing) throws Exception {
        
        final var overlappings = reservationService.checkForOverlappings(
                carSharing.getCar(),
                carSharing.getEndsAt(),
                LocalDateTime.now().truncatedTo(ChronoUnit.HOURS).plusHours(1));
        
        overlappings
                .stream()
                .map(id -> {
                    final var reservation = reservationService.getReservation(id);
                    if (reservation instanceof BlockingReservation) {
                        return null;
                    } else if (reservation instanceof Shift) {
                        return ((Shift) reservation).getDriver();
                    } else if (reservation instanceof CarSharing) {
                        return ((CarSharing) reservation).getDriver();
                    }
                    throw new RuntimeException(
                            "Unexpected typo of reservation '"
                            + reservation.getClass().getName()
                            + "'. Did you forget to extend this if-statement?");
                })
                .filter(driver -> driver != null)
                .forEach(driver -> {
                    try {
                        smsService.sendSms(
                                "car-sharing/inform-next-driver-about-delay",
                                CarSharingService.class.getSimpleName() + "#informNextDriverAboutDelay",
                                properties.getPassanagerServicePhoneNumber(),
                                driver.getMemberId().toString(),
                                driver.getPhoneNumber(),
                                NamedObject.from(carSharing).as("carSharing"));
                    } catch (Exception e) {
                        logger.error("Could not inform next driver ({}) about delay due to longer usage of car-sharing {}!",
                                driver.getMemberId(),
                                carSharing.getId(),
                                e);
                    }
                });
        
    }

    @WorkflowTask(taskDefinition = "confirmStartOfUsage")
    public void confirmStartOfUsageForm(
            final CarSharing carSharing,
            final @TaskId String taskId,
            final @TaskEvent Event event) {

        if (event == Event.CREATED) {
            carSharing.setUserTaskId(taskId);
            carSharing.setUserTaskType("confirmStartOfUsage");
        } else {
            carSharing.setUserTaskId(null);
            carSharing.setUserTaskType(null);
        }

    }
    
    @WorkflowTask(taskDefinition = "confirmEndOfUsage")
    public void confirmEndOfUsageForm(
            final CarSharing carSharing,
            final @TaskId String taskId,
            final @TaskEvent Event event) {

        if (event == Event.CREATED) {
            carSharing.setUserTaskId(taskId);
            carSharing.setUserTaskType("confirmEndOfUsage");
        } else {
            carSharing.setUserTaskId(null);
            carSharing.setUserTaskType(null);
        }

    }
    
    public CarSharing extendCarSharing(
            final String carId,
            final String reservationId,
            final String userTaskId,
            final LocalDateTime timestamp) {

        final var carSharingFound = carSharings.findById(reservationId);
        if (carSharingFound.isEmpty()) {
            return null;
        }
        final var carSharing = carSharingFound.get();
        
        final var car = carSharing.getCar();
        if (!car.getId().equals(carId)) {
            return null;
        }

        if ((carSharing.getUserTaskId() == null)
                || !carSharing.getUserTaskId().equals(userTaskId)) {
            return null;
        }

        if (timestamp.isBefore(carSharing.getEndsAt())
                || timestamp.isEqual(carSharing.getEndsAt())) {
            return carSharing;
        }
        
        final var conflicts = !reservationService
                .checkForOverlappings(
                        car,
                        carSharing.getEndsAt(),
                        timestamp)
                .isEmpty();
        if (conflicts) {
            throw new ElmoException("extend-not-possible");
        }
        
        carSharing.setEndsAt(timestamp);
        
        return carSharing;

    }
    
    public CarSharing startOrStopCarSharing(
            final String carId,
            final String reservationId,
            final String userTaskId,
            final LocalDateTime timestamp,
            final Integer km,
            final String comment) {
        
        final var carSharingFound = carSharings.findById(reservationId);
        if (carSharingFound.isEmpty()) {
            return null;
        }
        final var carSharing = carSharingFound.get();
                
        final var car = carSharing.getCar();
        if (!car.getId().equals(carId)) {
            return null;
        }
        
        if ((carSharing.getUserTaskId() == null)
                || !carSharing.getUserTaskId().equals(userTaskId)) {
            return null;
        }
        
        final var now = LocalDateTime.now();
        
        if (carSharing.getKmAtStart() == null) {
            
            carSharing.setStartUsage(now);
            carSharing.setKmAtStart(km);
            carSharing.setStatus(Status.ONGOING);
            
        } else {
            
            final var endOfUsage = timestamp == null
                    ? carSharing.getEndsAt()
                    : timestamp
                            .truncatedTo(ChronoUnit.HOURS)
                            .plusHours(timestamp.getMinute() == 0 ? 0 : 1);
            carSharing.setEndsAt(endOfUsage);
            carSharing.setEndUsage(now);
            carSharing.setKmAtEnd(km);
            carSharing.setStatus(Status.COMPLETED);
            
        }
        
        carSharing.setUserTaskId(null);
        carSharing.setUserTaskType(null);
        carSharing.setComment(comment);
        
        car.setKm(km);
        car.setKmConfirmed(true);
        car.setKmConfirmedAt(LocalDateTime.now());
        
        processService.completeUserTask(carSharing, userTaskId);
        
        return carSharing;
        
    }

    @WorkflowTask
    @WorkflowTask(taskDefinition = "recordUsage") // legacy
    public void updateRecordedUsage(
            final CarSharing carSharing) {
        
        final var now = LocalDateTime.now();
        
        // cancelled before start of car-sharing
        if (carSharing.getStartsAt().isAfter(now)) {
            
            carSharing.setCancelled(true);
            carSharing.setStatus(Status.CANCELLED);
            carSharing.getDriver().setHoursConsumedCarSharing(
                    carSharing.getDriver().getHoursConsumedCarSharing()
                    - carSharing.getHoursPlanned());
            
        }
        // cancelled before end of car-sharing or completed normally
        else {
            
            if (carSharing.getHours() != carSharing.getHoursPlanned()) {
                
                final var hoursCarReturnedEarlier =
                        carSharing.getHoursPlanned()
                        - carSharing.getHours();
                // hoursCarReturnedEarlier might be negative in case of
                // car returned later than planned. In this case the
                // driver's fixed hours of consumed car-sharing may increase
                // and become greater than the hours served passenger service.
                // this special situation will not be treated in a special way.
                carSharing.getDriver().setHoursConsumedCarSharing(
                        carSharing.getDriver().getHoursConsumedCarSharing()
                        - hoursCarReturnedEarlier);
                
            }
            
            carSharing.setStatus(Status.COMPLETED);
            
        }

    }

}
