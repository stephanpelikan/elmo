package at.elmo.reservation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;

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

    public List<ReservationBase> findReservations(
            final LocalDateTime startsAt,
            final LocalDateTime endsAt,
            final boolean history) {

        final Sort sort = history
                ? Sort.by(Direction.DESC, "startsAt")
                : Sort.by(Direction.ASC, "startsAt");

        return reservations.findInPeriod(startsAt, endsAt, sort);

    }

}
