package at.elmo.reservation.carsharing;

import at.elmo.car.Car;
import at.elmo.member.Member;
import at.elmo.member.MemberRepository;
import at.elmo.reservation.carsharing.CarSharing.Status;
import at.phactum.bp.blueprint.process.ProcessService;
import at.phactum.bp.blueprint.service.BpmnProcess;
import at.phactum.bp.blueprint.service.TaskEvent;
import at.phactum.bp.blueprint.service.TaskEvent.Event;
import at.phactum.bp.blueprint.service.TaskId;
import at.phactum.bp.blueprint.service.WorkflowService;
import at.phactum.bp.blueprint.service.WorkflowTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@WorkflowService(
        workflowAggregateClass = CarSharing.class,
        bpmnProcess = { @BpmnProcess(bpmnProcessId = "CarSharingLifecycle") })
@Transactional
public class CarSharingService {

    @Autowired
    private CarSharingRepository carSharings;
    
    @Autowired
    private MemberRepository members;

    @Autowired
    private ProcessService<CarSharing> processService;
    
    public long numberOfFutureCarSharings(
            final Member driver) {

        return carSharings.countByStatusAndStartsAtGreaterThanEqualAndDriver_Id(
                Status.RESERVED,
                LocalDateTime.now(),
                driver.getId());

    }
    
    public CarSharing addCarSharing(
            final Car car,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt,
            final Member driver) throws Exception {

        final var carSharing = new CarSharing();
        carSharing.setId(UUID.randomUUID().toString());
        carSharing.setCar(car);
        carSharing.setDriver(driver);
        carSharing.setStartsAt(startsAt);
        carSharing.setEndsAt(endsAt);
        carSharing.setStatus(Status.RESERVED);
        carSharing.setHoursPlanned(carSharing.getHours());

        final var newHours = driver
                .getHoursConsumedCarSharing()
                + carSharing.getHoursPlanned();
        members
                .getById(driver.getId())
                .setHoursConsumedCarSharing(newHours);

        return processService.startWorkflow(carSharing);

    }
    
    public boolean cancelCarSharingDueToConflict(
            final String reservationId) {
        
        return cancelCarSharing(
                reservationId,
                null,
                null,
                "CancelledDueToConflict");
        
    }

    public boolean cancelCarSharingByDriver(
            final String reservationId) {
        
        return cancelCarSharing(
                reservationId,
                LocalDateTime
                        .now()
                        .truncatedTo(ChronoUnit.HOURS)
                        .plusHours(1),
                null,
                "CancelledByDriver");
        
    }

    public boolean cancelCarSharingByAdministrator(
            final String reservationId,
            final String comment) {
        
        return cancelCarSharing(
                reservationId,
                LocalDateTime
                        .now()
                        .truncatedTo(ChronoUnit.HOURS)
                        .plusHours(1),
                comment,
                "CancelledByAdministrator");
        
    }

    private boolean cancelCarSharing(
            final String reservationId,
            final LocalDateTime endOfUsage,
            final String comment,
            final String causingEvent) {
        
        final var carSharing = carSharings.findById(reservationId);
        if (carSharing.isEmpty()) {
            return false;
        }
        
        if ((endOfUsage != null)
                && !endOfUsage.isBefore(carSharing.get().getEndsAt()) ){
            carSharing.get().setEndsAt(endOfUsage);
        }
        
        if (comment != null) {
            carSharing.get().setComment(comment);
        }
        
        processService.correlateMessage(
                carSharing.get(),
                causingEvent);
        
        return true;
        
    }
    
    @WorkflowTask
    public void remindDriverToConfirmStartOfUsage() {

    }

    @WorkflowTask
    public void remindDriverToConfirmEndOfUsage() {

    }

    @WorkflowTask
    public void informDriverAboutCancellation() {

    }

    @WorkflowTask
    public void informAboutUnconfirmedUsage() {

    }

    @WorkflowTask(taskDefinition = "confirmStartOfUsage")
    public void confirmStartOfUsageForm(
            final CarSharing carSharing,
            final @TaskId String taskId,
            final @TaskEvent Event event) {

        if (event == Event.CREATED) {
            carSharing.setUserTaskId(taskId);
        } else {
            carSharing.setUserTaskId(null);
        }

    }

    @WorkflowTask(taskDefinition = "confirmEndOfUsage")
    public void confirmEndOfUsageForm(
            final CarSharing carSharing,
            final @TaskId String taskId,
            final @TaskEvent Event event) {

        if (event == Event.CREATED) {
            carSharing.setUserTaskId(taskId);
        } else {
            carSharing.setUserTaskId(null);
        }

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
            
        }

    }

}
