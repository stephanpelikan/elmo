package at.elmo.car;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "elmo.cars", ignoreUnknownFields = false)
public class CarProperties {

    private List<Car> predefined = List.of();

    public List<Car> getPredefined() {
        return predefined;
    }

    public void setPredefined(List<Car> predefined) {
        this.predefined = predefined;
    }

}
