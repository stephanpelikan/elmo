package at.elmo.reservation;

import at.elmo.car.Car;
import at.elmo.config.db.DbNotification;
import at.elmo.config.db.DbNotification.Action;
import at.elmo.member.Member;
import at.elmo.member.MemberRepository;
import at.elmo.reservation.history.DriverConsumptionPerYear;
import at.elmo.util.spring.NotificationEvent;
import at.elmo.util.spring.NotificationEvent.Type;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.NullNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

import javax.persistence.EntityNotFoundException;
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
        final var reservationType = ((JsonNode) record
                .get("type"))
                .asText();

        final var type = notification.getAction() == Action.INSERT
                ? NotificationEvent.Type.NEW
                : notification.getAction() == Action.DELETE
                ? NotificationEvent.Type.DELETE
                : NotificationEvent.Type.UPDATE;
        
        applicationEventPublisher.publishEvent(
                new ReservationNotification(
                        reservationType,
                        type,
                        id,
                        driverId,
                        LocalDateTime.parse(startsAt),
                        LocalDateTime.parse(endsAt),
                        carId));
        
        if (type != Type.UPDATE) {
            return;
        }
            
        final var oldRecord = notification.getOld();
        
        var previousReservationId = ((JsonNode) record
                .get("previous_res"));
        if (previousReservationId == null) {
            previousReservationId = NullNode.getInstance();
        }
        var oldPreviousReservationId = ((JsonNode) oldRecord
                .get("previous_res"));
        if (oldPreviousReservationId == null) {
            oldPreviousReservationId = NullNode.getInstance();
        }
        if (((oldPreviousReservationId == null)
                        && (previousReservationId != null))
                || ((oldPreviousReservationId != null)
                        && (previousReservationId == null))
                || ((oldPreviousReservationId != null)
                        && !oldPreviousReservationId.equals(previousReservationId))) {
        
            applicationEventPublisher.publishEvent(
                    new ReservationNeighborChangedNotification(
                            type,
                            id,
                            carId,
                            oldPreviousReservationId.isNull() ? null : oldPreviousReservationId.asText(),
                            previousReservationId.isNull() ? null : previousReservationId.asText(),
                            true));
                            
        }

        var nextReservationId = ((JsonNode) record
                .get("next_res"));
        if (nextReservationId == null) {
            nextReservationId = NullNode.getInstance();
        }
        var oldNextReservationId = ((JsonNode) oldRecord
                .get("next_res"));
        if (oldNextReservationId == null) {
            oldNextReservationId = NullNode.getInstance();
        }
        if (((oldNextReservationId == null)
                        && (nextReservationId != null))
                || ((oldNextReservationId != null)
                        && (nextReservationId == null))
                || ((oldNextReservationId != null)
                        && !oldNextReservationId.equals(nextReservationId))) {
        
            applicationEventPublisher.publishEvent(
                    new ReservationNeighborChangedNotification(
                            type,
                            id,
                            carId,
                            oldNextReservationId.isNull() ? null : oldNextReservationId.asText(),
                            nextReservationId.isNull() ? null : nextReservationId.asText(),
                            false));
                            
        }
        
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
    
    public ReservationBase getReservation(
            final String id) {
        
        return reservations
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException());
        
    }
    
    public ReservationBase getReservationByStartsAt(
            final Car car,
            final LocalDateTime startsAt) {
        
        final var reservation = reservations
                .findByCarAndStartsAtAndCancelled(car, startsAt, false);
        if (reservation.isPresent()) {
            return reservation.get();
        }
        return null;

    }
    
    public ReservationBase getReservationByEndsAt(
            final Car car,
            final LocalDateTime endsAt) {
        
        final var reservation = reservations
                .findByCarAndEndsAtAndCancelled(car, endsAt, false);
        if (reservation.isPresent()) {
            return reservation.get();
        }
        return null;

    }
    
    public List<DriverConsumptionPerYear> getDriverConsumptionsPerYear(
            final Member driver) {
        
        return reservations.findAllByDriver(driver);
        
    }
    
}
