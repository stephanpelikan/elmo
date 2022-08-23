package at.elmo.reservation.shift;

import at.phactum.bp.blueprint.process.ProcessService;
import at.phactum.bp.blueprint.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;

@Service
@WorkflowService(workflowAggregateClass = Shift.class)
@Transactional
public class ShiftLifecycle {

    @Autowired
    private ProcessService<Shift> processService;

    @Autowired
    private ShiftRepository shiftRepository;

    public void createShift(
        final Shift shift) throws Exception {

        final var result = shiftRepository.saveAndFlush(shift);
        processService.startWorkflow(result);
    }
}
