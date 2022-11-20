package at.elmo.reservation.carsharing;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.lang.NonNull;

@ConfigurationProperties(prefix = "elmo.car-sharing", ignoreUnknownFields = false)
public class CarSharingProperties {

    @NonNull
    private int maxHours;
    
    @NonNull
    private int maxReservations;

    public int getMaxHours() {
        return maxHours;
    }

    public void setMaxHours(int maxHours) {
        this.maxHours = maxHours;
    }

    public int getMaxReservations() {
        return maxReservations;
    }

    public void setMaxReservations(int maxReservations) {
        this.maxReservations = maxReservations;
    }
    
}
