package at.elmo.util.config;

import at.elmo.config.ElmoProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class ConfigService {

    private static final String LAST_MEMBER_ID = "last_member_id";

    private static final String LAST_SHIFT_GENERATION_DATE = "last-shift-generation-date_";

    private static final String JWT_SECRET = "jwt_secret";

    @Autowired
    private ConfigValueRepository configValues;
    
    @Autowired
    private ElmoProperties properties;

    public Optional<String> getJwtSecret() {

        final var value = configValues.findById(JWT_SECRET);
        if (value.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(value.get().getValue());

    }

    public void setJwtSecret(
            final String jwtSecret) {

        configValues.saveAndFlush(
                new ConfigValue(
                        JWT_SECRET,
                        jwtSecret));

    }

    public LocalDate getLastShiftGenerationDate(
            final String carId) {

        final var lastShiftDateConfig = LAST_SHIFT_GENERATION_DATE + carId;

        final var lastCreatedShift = configValues
                .findById(lastShiftDateConfig);
        if (lastCreatedShift.isEmpty()) {
            return LocalDate.now();
        }

        return LocalDate.parse(lastCreatedShift.get().getValue());

    }
    
    public void setLastShiftGenerationDate(
            final String carId,
            final LocalDate date) {
        
        final var lastShiftDateConfig = LAST_SHIFT_GENERATION_DATE + carId;
        final var lastCreatedShift = new ConfigValue(
                lastShiftDateConfig,
                date.toString());
        configValues.saveAndFlush(lastCreatedShift);
        
    }
    
    public int getLastMemberId() {
        
        return configValues
                .findById(LAST_MEMBER_ID)
                .map(ConfigValue::getValue)
                .map(Integer::parseInt)
                .orElse(properties.getInitialNewMemberId() - 1);
        
    }
    
    public void setLastMemberId(
            final int memberId) {
        
        configValues.saveAndFlush(
                new ConfigValue(
                        LAST_MEMBER_ID,
                        Integer.toString(memberId)));
        
    }

}
