package at.elmo.reservation.shift;

import at.elmo.administration.api.v1.Shift;
import at.elmo.administration.api.v1.ShiftApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

import javax.validation.Valid;

@RestController("shiftAdministrationApiController")
@RequestMapping("/api/v1")
public class AdministrationApiController implements ShiftApi {

    @Autowired
    private AdministrationApiMapper mapper;

    @Autowired
    private ShiftService shiftService;

    @Override
    public ResponseEntity<List<Shift>> getShifts(
            final @Valid LocalDate startDate,
            final @Valid LocalDate endDate) {

        final var allShifts = shiftService.getShifts();
        final var result = mapper.toApi(allShifts);
        return ResponseEntity.ok(result);

    }

}
