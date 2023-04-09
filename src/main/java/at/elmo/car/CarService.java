package at.elmo.car;

import at.elmo.member.login.ElmoOAuth2Provider;
import at.elmo.util.refreshtoken.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import javax.transaction.Transactional;

@Service
@Transactional
public class CarService {

    @Autowired
    private CarProperties properties;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private CarRepository cars;

    public Optional<Car> getCar(
            final String carId) {

        return cars.findById(carId);

    }

    public Car createCar(
            final boolean carSharing,
            final boolean passengerService,
            final String name,
            final String shortcut,
            final String phoneNumber) {

        final var newCar = new Car();
        newCar.setId(UUID.randomUUID().toString());
        newCar.setCarSharing(carSharing);
        newCar.setPassengerService(passengerService);
        newCar.setName(name);
        newCar.setShortcut(shortcut);
        newCar.setPhoneNumber(phoneNumber);

        return cars.saveAndFlush(newCar);

    }

    public void setCar(
            final String carId,
            final boolean carSharing,
            final boolean passengerService,
            final String name,
            final String phoneNumber) {

        final var car = getCar(carId);
        if (car.isEmpty()) {
            throw new RuntimeException(
                    "No car '"
                    + carId
                    + "' found!");
        }

        final var changedCar = car.get();
        changedCar.setCarSharing(carSharing);
        changedCar.setPassengerService(passengerService);
        changedCar.setName(name);
        changedCar.setPhoneNumber(StringUtils.hasText(phoneNumber) ? phoneNumber : null);
        cars.saveAndFlush(changedCar);

    }

    public boolean deleteCar(
            final String carId) {

        cars.deleteById(carId);

        return true;

    }

    public List<Car> getPassengerServiceCars() {

        return cars.findByPassengerService(true);

    }
    
    public long getCountOfPassengerServiceCars() {
        
        return cars.countByPassengerService(true);
        
    }

    public Page<Car> getCars(
            final int page,
            final int amount) {

        final var pageable =
                PageRequest.of(page, amount, Direction.ASC, "name", "createdAt");

        return cars.findAll(pageable);

    }

    public List<Car> getCarSharingCars() {

        return cars.findByCarSharing(true);

    }

    public int getCountCars() {

        return (int) cars.count();

    }

    public void buildPredefinedCars() {

        properties
                .getPredefined()
                .stream()
                .filter(car -> cars.findByShortcut(car.getShortcut()).isEmpty())
                .peek(car -> car.setId(UUID.randomUUID().toString()))
                .forEach(cars::save);

    }

    public String activateCarApp(
            final String carId) {

        final var car = cars.findById(carId);
        if (car.isEmpty()) {
            return null;
        }
        car.get().setAppActive(true);

        return refreshTokenService
                .buildRefreshToken(
                        car.get().getId(),
                        ElmoOAuth2Provider.ELMO);

    }

    public void deactivateCarApp(
            final String carId) {

        final var car = cars.findById(carId);
        if (car.isEmpty()) {
            return;
        }

        car.get().setAppActive(false);

        refreshTokenService.deleteAllTokens(
                carId,
                ElmoOAuth2Provider.ELMO);

    }

}
