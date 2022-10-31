package at.elmo.reservation;

import at.elmo.car.Car;
import at.elmo.config.db.DbNotification;
import at.elmo.config.db.DbNotification.Action;
import at.elmo.member.MemberRepository;
import at.elmo.util.spring.NotificationEvent;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

import javax.transaction.Transactional;

@Service
@Transactional
public class ReservationService {
    
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Autowired
    private ReservationRepository reservations;
    
    @Autowired
    private MemberRepository members;

    @Async
    @EventListener(
            classes = DbNotification.class,
            condition = "#notification.table == '" + ReservationBase.TABLE_NAME + "'")
    public void processDbNotification(
            final DbNotification notification) throws Exception {
        
        final var record = notification.getRecord() != null
                ? notification.getRecord()
                : notification.getOld();
        
        final var id = ((JsonNode) record
                .get("id"))
                .asText();

        Integer driverId = null;
        final var memberId = ((JsonNode) record
                .get("member"))
                .asText();
        if (StringUtils.hasText(memberId)) {
            final var member = members.findById(memberId);
            if (member.isPresent()) {
                driverId = member.get().getMemberId();
            }
        }

        final var startsAt = ((JsonNode) record
                .get("starts_at"))
                .asText();

        final var endsAt = ((JsonNode) record
                .get("ends_at"))
                .asText();

        final var carId = ((JsonNode) record
                .get("car"))
                .asText();

        final var type = notification.getAction() == Action.INSERT
                ? NotificationEvent.Type.NEW
                : notification.getAction() == Action.DELETE
                ? NotificationEvent.Type.DELETE
                : NotificationEvent.Type.UPDATE;
        
        applicationEventPublisher.publishEvent(
                new ReservationNotification(
                        "Reservation#all",
                        type,
                        id,
                        driverId,
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
                endsAt);

    }
    
}
