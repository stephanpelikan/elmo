package at.elmo.reservation.passengerservice.shift;

import io.vanillabp.spi.service.WorkflowService;
import io.vanillabp.spi.service.WorkflowTask;
import org.apache.commons.lang3.NotImplementedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@WorkflowService(workflowAggregateClass = Shift.class)
@Transactional
public class ShiftDue {

    @WorkflowTask
    public void informPassengerAboutShiftNotClaimedYet() {

        throw new NotImplementedException();

    }

}
