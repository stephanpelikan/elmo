package at.elmo.reservation;

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
import java.util.LinkedList;
import java.util.List;

@RestController("reservationGuiApi")
@RequestMapping("/api/v1")
public class GuiApiController implements ReservationApi {
    
    @Autowired
    private UserContext userContext;
    
    @Autowired
    private ReservationService reservationService;
    
    @Override
    @Secured(Role.ROLE_DRIVER)
    public ResponseEntity<List<ReservationOverviewTotal>> getReservationOverviewTotals() {
        
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
                        result.setCarSharingHours(year.getSeconds() / 3600f);
                        result.setCarSharingCount(year.getCount());
                    } else if (year.getType().equals(Shift.TYPE)) {
                        result.setPassangerServiceHours(year.getSeconds() / 3600f);
                        result.setPassangerServiceCount(year.getCount());
                    } else {
                        throw new RuntimeException("Unsupported type '"
                                + year.getType() + "'");
                    }
                });
        
        final var result = new LinkedList<>(years.values());
        
        return ResponseEntity.ok(result);
        
    }
    
}
