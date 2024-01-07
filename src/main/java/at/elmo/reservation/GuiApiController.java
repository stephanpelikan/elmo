package at.elmo.reservation;

import at.elmo.gui.api.v1.DriverActivities;
import at.elmo.gui.api.v1.GetDriverActivitiesOfYear200ResponseInner;
import at.elmo.gui.api.v1.ReservationApi;
import at.elmo.gui.api.v1.ReservationOverviewTotal;
import at.elmo.member.Role;
import at.elmo.reservation.carsharing.CarSharing;
import at.elmo.reservation.passengerservice.shift.Shift;
import at.elmo.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;

@RestController("reservationGuiApi")
@RequestMapping("/api/v1")
public class GuiApiController implements ReservationApi {
    
    @Autowired
    private UserContext userContext;
    
    @Autowired
    private ReservationService reservationService;
    
    @Autowired
    private GuiApiMapper mapper;

    @Override
    @Secured(Role.ROLE_DRIVER)
    public ResponseEntity<DriverActivities> getDriverActivities() {
        
        final var driver = userContext.getLoggedInMember();
        
        final var years = new LinkedHashMap<Integer, ReservationOverviewTotal>() {
            private static final long serialVersionUID = 1L;

            @Override
            public ReservationOverviewTotal get(Object key) {
                var result = super.get(key);
                if (result == null) {
                    final var year = (Integer) key;
                    result = new ReservationOverviewTotal();
                    result.setYear(year);
                    result.setCarSharingHours(0f);
                    result.setPassengerServiceHours(0f);
                    super.put(year, result);
                }
                return result;
            }
        };
        
        reservationService
                .getDriverConsumptionsPerYear(driver)
                .forEach(year -> {
                    final var result = years.get(year.getYear());
                    if (year.getType().equals(CarSharing.TYPE)) {
                        result.setCarSharingHours(year.getMinutes() / 60f);
                    } else if (year.getType().equals(Shift.TYPE)) {
                        result.setPassengerServiceHours(year.getMinutes() / 60f);
                    } else {
                        throw new RuntimeException("Unsupported type '"
                                + year.getType() + "'");
                    }
                });
        
        if (driver.getHoursServedPassengerServiceImportYear() != null) {

            final var importYear = driver
                    .getCreatedAt()
                    .getYear();
            final var year = years.get(importYear);
            year.setPassengerServiceHours(
                    year.getPassengerServiceHours()
                    + driver.getHoursServedPassengerServiceImportYear());

        }

        if (driver.getHoursConsumedCarSharingImportYear() != null) {

            final var importYear = driver
                    .getCreatedAt()
                    .getYear();
            final var year = years.get(importYear);
            year.setCarSharingHours(
                    year.getCarSharingHours()
                    + driver.getHoursConsumedCarSharingImportYear());

        }

        final var result = new DriverActivities();
        years.values().forEach(result::addOverviewItem);
        result.setCarSharingHours((float) driver.getHoursConsumedCarSharing());
        result.setPassengerServiceHours((float) driver.getHoursServedPassengerService());
        
        return ResponseEntity.ok(result);
        
    }

    @Override
    @Secured(Role.ROLE_DRIVER)
    public ResponseEntity<List<GetDriverActivitiesOfYear200ResponseInner>> getDriverActivitiesOfYear(
            final Integer year) {

        final var driver = userContext.getLoggedInMember();

        final var consumptions = reservationService
                .getDriverConsumptionsOfAYear(driver, year);
        
        final var result = mapper.toApi(consumptions);
        
        return ResponseEntity.ok(result);
        
    }
    
}
