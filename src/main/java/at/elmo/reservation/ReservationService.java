package at.elmo.reservation;

import at.elmo.car.Car;
import at.elmo.config.db.DbNotification;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {
    
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Autowired
    private ReservationRepository reservations;

    @Async
    @EventListener(
            classes = DbNotification.class,
            condition = "#notification.table == '" + ReservationBase.TABLE_NAME + "'")
    public void processDbNotification(
            final DbNotification notification) throws Exception {
        
        final var startsAt = ((JsonNode) notification
                .getRecord()
                .get("starts_at"))
                .asText();

        final var endsAt = ((JsonNode) notification
                .getRecord()
                .get("ends_at"))
                .asText();

        final var carId = ((JsonNode) notification
                .getRecord()
                .get("car"))
                .asText();

        applicationEventPublisher.publishEvent(
                new ReservationNotification(
                        ReservationService.class,
                        LocalDateTime.parse(startsAt),
                        LocalDateTime.parse(endsAt),
                        carId));
    }
    
    public List<String> checkForOverlappings(
            final Car car,
            final LocalDateTime startsAt,
            final LocalDateTime endsAt) {

        return reservations.findOverlappingReservationsIds(
                startsAt,
                endsAt,
                car);

    }

    public List<ReservationBase> findReservations(
            final LocalDateTime startsAt,
            final LocalDateTime endsAt) {

        return reservations.findInPeriod(
                startsAt,
                endsAt,
                Sort.by(Direction.ASC, "startsAt"));

    }
    
}
