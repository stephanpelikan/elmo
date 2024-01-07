package at.elmo.reservation.passengerservice.shift;

import at.elmo.member.MemberRepository;
import io.vanillabp.spi.service.BpmnProcess;
import io.vanillabp.spi.service.WorkflowService;
import io.vanillabp.spi.service.WorkflowTask;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@WorkflowService(
        workflowAggregateClass = Shift.class,
        bpmnProcess = @BpmnProcess(bpmnProcessId = "ShiftLifecycle"),
        secondaryBpmnProcesses = { @BpmnProcess(bpmnProcessId = "ShiftSwapOfDriverRequested") })
@Transactional
public class ShiftSwapOfDriverRequested {

    @Autowired
    private MemberRepository members;

    @Autowired
    private ShiftService shiftService;

    @WorkflowTask
    public void informDriverAboutRequestForSwap(
            final Shift shift) {

        shiftService.sendDriverSms(
                shift.getDriver(),
                shift,
                "passenger-service/inform-driver-about-swap-requested",
                "informDriverAboutRequestForSwap");

    }

    @WorkflowTask
    public void informDriverAboutSwapAccepted(
            final Shift shift) {

        shiftService.sendDriverSms(
                shift.getDriverRequestingSwap(),
                shift,
                "passenger-service/inform-driver-about-swap-was-accepted",
                "informDriverAboutSwapAccepted");

        shift.setDriver(
                shift.getDriverRequestingSwap());
        shift.setDriverRequestingSwap(null);

    }

    @WorkflowTask
    public void informDriverAboutSwapAcceptedByAdministrator(
            final Shift shift) {

        shiftService.sendDriverSms(
                shift.getDriver(),
                shift,
                "passenger-service/inform-driver-about-swap-was-accepted-by-administrator",
                "informDriverAboutSwapAcceptedByAdministrator");

    }

    @WorkflowTask
    public void informDriverAboutSwapRejected(
            final Shift shift) {

        shiftService.sendDriverSms(
                shift.getDriverRequestingSwap(),
                shift,
                "passenger-service/inform-driver-about-swap-was-rejected",
                "informDriverAboutSwapRejected");

        shift.setDriverRequestingSwap(null);

    }

    @WorkflowTask
    public void informDriverAboutSwapRejectedByAdministrator(
            final Shift shift) {

        shiftService.sendDriverSms(
                shift.getDriver(),
                shift,
                "passenger-service/inform-driver-about-swap-was-rejected-by-administrator",
                "informDriverAboutSwapRejectedByAdministrator");

    }

    @WorkflowTask
    public void informDriverAboutCancellationOfSwap(
            final Shift shift) {

        shiftService.sendDriverSms(
                shift.getDriver(),
                shift,
                "passenger-service/inform-driver-about-cancellation-of-swap",
                "informDriverAboutCancellationOfSwap");

        shift.setDriverRequestingSwap(null);

    }

}
