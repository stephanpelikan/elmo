package at.elmo.reservation.carsharing;

import at.elmo.car.Car;
import at.elmo.member.Member;
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
    private ProcessService<CarSharing> processService;

    public long numberOfFutureCarSharings(
            final Member driver) {

        return carSharings.countByStatusAndStartsAtGreaterThanEqualAndDriver_Id(
                Status.RESERVED,
                LocalDateTime.now(),
                driver.getId());

    }

    public void addCarSharing(
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

    	final var newHours = driver.getHoursConsumedCarSharing()
    			+ carSharing.getHours();
    	driver.setHoursConsumedCarSharing(newHours);

        processService.startWorkflow(carSharing);

    }

    public void cancelCarSharing(
            final String carSharingId,
            final boolean cancelledByAdministrator,
            final String comment) {

        final var carSharing = carSharings.findById(carSharingId);
        if (carSharing.isEmpty()) {
            return;
        }

        carSharing.get().setCancelled(true);
        carSharing.get().setStatus(Status.CANCELLED);
        carSharing.get().setComment(comment);

        processService.correlateMessage(
                carSharing.get(),
                cancelledByAdministrator ? "CancelledByAdministrator" : "CancelledByDriver");

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
    public void recordUsage(
            final CarSharing carSharing) {

    }

}
