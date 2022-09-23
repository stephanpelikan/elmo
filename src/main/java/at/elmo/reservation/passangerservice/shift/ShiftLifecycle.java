package at.elmo.reservation.passangerservice.shift;

import at.phactum.bp.blueprint.process.ProcessService;
import at.phactum.bp.blueprint.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@WorkflowService(workflowAggregateClass = Shift.class)
@Transactional
public class ShiftLifecycle {

    @Autowired
    private ProcessService<Shift> processService;

    public void createShift(
            final Shift shift) throws Exception {

        processService.startWorkflow(shift);

    }
}
