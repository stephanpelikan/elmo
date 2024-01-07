package at.elmo.reservation.passengerservice.shift;

import at.elmo.member.MemberRepository;
import io.vanillabp.spi.service.BpmnProcess;
import io.vanillabp.spi.service.WorkflowService;
import io.vanillabp.spi.service.WorkflowTask;
import org.apache.commons.lang3.NotImplementedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@WorkflowService(
        workflowAggregateClass = Shift.class,
        bpmnProcess = @BpmnProcess(bpmnProcessId = "ShiftLifecycle"),
        secondaryBpmnProcesses = { @BpmnProcess(bpmnProcessId = "ShiftSwapOfDriverNeeded") })
@Transactional
public class ShiftSwapOfDriverNeeded {

    @Autowired
    private MemberRepository members;

    @Autowired
    private ShiftService shiftService;

    @WorkflowTask
    public void informDriversAboutSwapNeeded(
            final Shift shift) {

        members
                .findActiveDrivers()
                .forEach(driver -> shiftService.sendDriverSms(
                        driver,
                        shift,
                        "passenger-service/inform-driver-about-swap-needed",
                        "informDriversAboutSwapNeeded"));

    }

    @WorkflowTask
    public void turnReservationsIntoConditionally(
            final Shift shift) {

        throw new NotImplementedException();

    }

    @WorkflowTask
    public void askDriversToClaimShift(
            final Shift shift) {

        shiftService.askDriversToClaimShift(shift);

    }

    @WorkflowTask
    public void turnReservationsIntoSteady(
            final Shift shift) {

        throw new NotImplementedException();

    }

    @WorkflowTask
    public void informDriversAboutSwapDone(
            final Shift shift) {

        members
                .findActiveDrivers()
                .forEach(driver -> shiftService.sendDriverSms(
                        driver,
                        shift,
                        "passenger-service/inform-driver-about-swap-done",
                        "informDriversAboutSwapDone"));

    }

}
