package at.elmo.car;

import at.elmo.administration.api.v1.Car;
import at.elmo.administration.api.v1.CarApi;
import at.elmo.administration.api.v1.Cars;
import at.elmo.administration.api.v1.CountOfCars;
import at.elmo.administration.api.v1.TestTextMessage;
import at.elmo.member.login.ElmoOAuth2Provider;
import at.elmo.reservation.passangerservice.shift.ShiftService;
import at.elmo.util.exceptions.ElmoUserMessageException;
import at.elmo.util.exceptions.ElmoValidationException;
import at.elmo.util.refreshtoken.RefreshTokenService;
import at.elmo.util.sms.SmsService;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;

import javax.validation.Valid;

@RestController("carAdministrationApiController")
@RequestMapping("/api/v1")
public class AdministrationApiController implements CarApi {

    @Autowired
    private Logger logger;

    @Autowired
    private CarService carService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private AdministrationApiMapper mapper;

    @Autowired
    private SmsService smsService;

    @Autowired
    private ShiftService shiftService;
    
    @Override
    public ResponseEntity<Void> deleteCar(
            final String carId) {

        if (shiftService.hasShifts(carId)) {
            return ResponseEntity.badRequest().build();
        }
        
        carService.deleteCar(carId);

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<String> saveCar(
            final String carId,
            final @Valid Car car) {

        if (car == null) {
            return ResponseEntity.badRequest().build();
        }
        final var violations = new HashMap<String, String>();
        if (car.getPassangerService()
                && !StringUtils.hasText(car.getPhoneNumber())) {
            violations.put("phoneNumber", "missing");
        }
        if (StringUtils.hasText(car.getPhoneNumber())) {
            final var phoneNumberValid = smsService
                    .isValidPhoneNumberFormat(car.getPhoneNumber());
            if (!phoneNumberValid) {
                violations.put("phoneNumber", "format");
            }
        }
        if (!StringUtils.hasText(car.getName())) {
            violations.put("name", "missing");
        }
        if (!violations.isEmpty()) {
            throw new ElmoValidationException(violations);
        }

        if ("-".equals(carId)) {

            final var newCar = carService.createCar(
                    car.getCarSharing(),
                    car.getPassangerService(),
                    car.getName(),
                    car.getShortcut(),
                    car.getPhoneNumber());
            return ResponseEntity.ok(newCar.getId());

        } else {

            carService.setCar(
                    carId,
                    car.getCarSharing(),
                    car.getPassangerService(),
                    car.getName(),
                    car.getPhoneNumber());
            return ResponseEntity.ok(carId);

        }

    }

    @Override
    public ResponseEntity<Car> getCar(
            final String carId) {

        final var car = carService.getCar(carId);
        if (car.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        final var result = mapper.toApi(car.get());


        if (car.get().isAppActive()) {
            final var lastAppActivity = refreshTokenService.hasRefreshToken(
                    carId,
                    ElmoOAuth2Provider.ELMO);
            result.setLastAppActivity(lastAppActivity);
        }

        return ResponseEntity.ok(result);

    }

    @Override
    public ResponseEntity<Cars> getCars(
            final @Valid Integer pageNumber,
            final @Valid Integer pageSize) {

        final var cars = carService.getCars(pageNumber, pageSize);

        final var result = new Cars();
        result.setCars(mapper.toApi(cars.toList()));
        result.setPage(mapper.toApi(cars));

        return ResponseEntity.ok(result);

    }

    @Override
    public ResponseEntity<CountOfCars> getCountOfCars() {

        final var count = carService.getCountCars();

        final var result = new CountOfCars();
        result.setCount(count);

        return ResponseEntity.ok(result);

    }

    @Override
    public ResponseEntity<String> activateCarApp(
            final String carId) {

        final var activationCode = carService.activateCarApp(carId);

        return ResponseEntity.ok(activationCode);

    }

    @Override
    public ResponseEntity<Void> deactivateCarApp(
            final String carId) {

        carService.deactivateCarApp(carId);

        return ResponseEntity.ok().build();

    }

    @Override
    public ResponseEntity<Void> sendTestSms(
            final String carId,
            final @Valid TestTextMessage testTextMessage) {

        if ((testTextMessage == null)
                || !StringUtils.hasText(testTextMessage.getPhoneNumber())) {
            throw new ElmoValidationException("phoneNumber", "missing");
        }

        final var phoneNumberValid = smsService
                .isValidPhoneNumberFormat(testTextMessage.getPhoneNumber());
        if (!phoneNumberValid) {
            throw new ElmoValidationException("phoneNumber", "format");
        }

        try {

            smsService.sendSms(
                    "administration/test-sms",
                    carId,
                    testTextMessage.getPhoneNumber(),
                    carId,
                    testTextMessage.getPhoneNumber());

        } catch (Exception e) {
            logger.error("Could not send test SMS to car '{}'!", carId, e);
            throw new ElmoUserMessageException(e.getMessage());
        }

        return ResponseEntity.ok().build();

    }

}
