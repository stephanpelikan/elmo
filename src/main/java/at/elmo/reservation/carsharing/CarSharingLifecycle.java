package at.elmo.reservation.carsharing;

import at.phactum.bp.blueprint.process.ProcessService;
import at.phactum.bp.blueprint.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@WorkflowService(workflowAggregateClass = CarSharing.class)
@Transactional
public class CarSharingLifecycle {

    @Autowired
    private ProcessService<CarSharing> processService;

}
