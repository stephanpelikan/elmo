package at.elmo.app.api;

import at.elmo.app.api.v1.AppApi;
import at.elmo.app.api.v1.TextMessages;
import at.elmo.car.CarService;
import at.elmo.config.web.JwtSecurityFilter;
import at.elmo.member.login.ElmoOAuth2User;
import at.elmo.member.login.GuiApiController;
import at.elmo.util.sms.SmsEvent;
import at.elmo.util.sms.SmsService;
import at.elmo.util.spring.PingNotification;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.UUID;

import javax.validation.constraints.NotNull;

@RestController("appApiController")
@RequestMapping("/api/v1")
public class AppApiController implements AppApi {

    @Autowired
    private Logger logger;

    @Autowired
    private AppMapper mapper;

    @Autowired
    private SmsService smsService;

    @Autowired
    private CarService carService;

    private Map<String, SseEmitter> smsEmitters = new HashMap<>();

    @Override
    public ResponseEntity<Void> testAppActivation() {

        return ResponseEntity.ok().build();

    }

    @RequestMapping(
            method = RequestMethod.GET,
            value = "/app/text-messages-notification/{token}"
        )
    public SseEmitter smsSubscription(
            @NotNull @PathVariable(value = "token", required = true) String token) throws Exception {

        final var carId = JwtSecurityFilter.getCarIdFromToken(token);
        final var phoneNumber = getPhoneNumberOfCar(carId);

        final var smsEmitter = new SseEmitter(-1l);
        smsEmitters.put(phoneNumber, smsEmitter);

        return smsEmitter;

    }

    @EventListener
    @Async
    protected void sendSms(
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
        
        final var ping = new PingNotification(GuiApiController.class.getName());
        
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
                                        .name(ping.getType()));
                    } catch (Exception e) {
                        toBeDeleted.add(entry.getKey());
                    }
                });
        toBeDeleted.forEach(smsEmitters::remove);
        
    }

    @Override
    @Secured("ROLE_CAR")
    public ResponseEntity<String> requestSeeAuthToken() {

        final var user = (ElmoOAuth2User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        final var token = JwtSecurityFilter.generateToken(user, 60);

        return ResponseEntity.ok(token);

    }

    @Override
    @Secured("ROLE_CAR")
    public ResponseEntity<TextMessages> requestTextMessages() {

        final var phoneNumber = getPhoneNumberOfCar();

        final var messages = smsService.getMessagesToSend(phoneNumber);

        final var result = new TextMessages();
        result.setTextMessages(
                mapper.toTextMessageApi(messages));

        result.getTextMessages().forEach(msg -> logger.info("Sent SMS to {}", msg.getRecipient()));

        return ResponseEntity.ok(result);

    }

    private String getPhoneNumberOfCar() {

        final var user = (ElmoOAuth2User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        final var carId = user.getElmoId();

        return getPhoneNumberOfCar(carId);

    }

    private String getPhoneNumberOfCar(final String carId) {

        final var car = carService.getCar(carId);
        if (car.isEmpty()
                || !StringUtils.hasText(car.get().getPhoneNumber())) {
            throw new RuntimeException("not found");
        }

        return car.get().getPhoneNumber();

    }

}
