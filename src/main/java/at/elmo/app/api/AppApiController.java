package at.elmo.app.api;

import at.elmo.app.api.v1.AppApi;
import at.elmo.app.api.v1.TextMessages;
import at.elmo.car.Car;
import at.elmo.member.Role;
import at.elmo.util.UserContext;
import at.elmo.util.sms.SmsEvent;
import at.elmo.util.sms.SmsService;
import at.elmo.util.spring.PingNotification;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.annotation.Secured;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.UUID;

@RestController("appApiController")
@RequestMapping("/api/v1")
@Secured(Role.ROLE_CAR)
public class AppApiController implements AppApi, AppApiControllerScheduledOrAsync {

    @Autowired
    private Logger logger;

    @Autowired
    private UserContext userContext;

    @Autowired
    private AppMapper mapper;

    @Autowired
    private SmsService smsService;

    @Autowired
    private TaskScheduler taskScheduler;

    private Map<String, SseEmitter> smsEmitters = new HashMap<>();

    @Override
    public ResponseEntity<Void> testAppActivation() {

        return ResponseEntity.ok().build();

    }

    @RequestMapping(
            method = RequestMethod.GET,
            value = "/app/text-messages-notification"
        )
    public SseEmitter smsSubscription() throws Exception {

        final var car = userContext.getLoggedInCar();
        final var phoneNumber = getPhoneNumberOfCar(car);

        final var smsEmitter = new SseEmitter(-1l);
        smsEmitters.put(phoneNumber, smsEmitter);

        // This ping forces the browser to treat the text/event-stream request
        // as closed an therefore the lock created in fetchApi.ts is released
        // to avoid the UI would stuck in cases of errors.
        taskScheduler.schedule(
                () -> {
                    try {
                        final var event = new SmsEvent(
                                AppApiController.class.getSimpleName() + "#smsSubscription",
                                null);
                        smsEmitter.send(
                                SseEmitter
                                        .event()
                                        .id(UUID.randomUUID().toString())
                                        .data(event, MediaType.APPLICATION_JSON)
                                        .name("SMS")
                                        .reconnectTime(30000));
                    } catch (Exception e) {
                        logger.warn("Could not SSE send confirmation, client might stuck");
                    }
                }, Instant.now().plusMillis(300));
        
        return smsEmitter;

    }

    @EventListener
    @Async
    public void sendSms(
            final SmsEvent event) throws Exception {

        final var smsEmitter = smsEmitters.get(event.getSenderNumber());
        if (smsEmitter == null) {
            return;
        }

        smsEmitter.send(
                SseEmitter
                        .event()
                        .id(UUID.randomUUID().toString())
                        .data(event, MediaType.APPLICATION_JSON)
                        .name("SMS")
                        .reconnectTime(30000));

    }

    /**
     * SseEmitter timeouts are absolute. So we need to ping
     * the connection and if the user closed the browser we
     * will see an error which indicates we have to drop 
     * this emitter. 
     */
    @Scheduled(fixedDelayString = "PT1M")
    public void cleanupSmsEmitters() {
        
        final var ping = new PingNotification();
        
        final var toBeDeleted = new LinkedList<String>();
        smsEmitters
                .entrySet()
                .forEach(entry -> {
                    try {
                        final var emitter = entry.getValue();
                        emitter.send(
                                SseEmitter
                                        .event()
                                        .id(UUID.randomUUID().toString())
                                        .data(ping, MediaType.APPLICATION_JSON)
                                        .name(ping.getSource().toString()));
                    } catch (Exception e) {
                        toBeDeleted.add(entry.getKey());
                    }
                });
        toBeDeleted.forEach(smsEmitters::remove);
        
    }

    @Override
    public ResponseEntity<TextMessages> requestTextMessages() {

        final var car = userContext.getLoggedInCar();
        final var phoneNumber = getPhoneNumberOfCar(car);

        final var messages = smsService.getMessagesToSend(phoneNumber);

        final var result = new TextMessages();
        result.setTextMessages(
                mapper.toTextMessageApi(messages));

        result.getTextMessages().forEach(msg -> logger.info("Sent SMS to {}", msg.getRecipient()));

        return ResponseEntity.ok(result);

    }

    private String getPhoneNumberOfCar(final Car car) {

        if ((car == null)
                || !StringUtils.hasText(car.getPhoneNumber())) {
            throw new RuntimeException("not found");
        }

        return car.getPhoneNumber();

    }

}
