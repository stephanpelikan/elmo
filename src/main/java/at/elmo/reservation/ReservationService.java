package at.elmo.reservation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {
    
    @Autowired
    private ReservationRepository reservations;
    
    public void checkForOverlappings(
            final LocalDateTime startsAt,
            final LocalDateTime endsAt) throws Exception {
        
        final var overlapping = reservations.findOverlappingReservationsIds(startsAt, endsAt);
        if (!overlapping.isEmpty()) {

            throw new Exception(
                    "Cannot create shift at "
                    + startsAt
                    + " -> "
                    + endsAt
                    + " due to existing overlapping shifts: "
                    + overlapping.stream().collect(Collectors.joining(", ")));

        }
        
    }
    
}
