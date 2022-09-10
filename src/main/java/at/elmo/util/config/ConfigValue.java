package at.elmo.util.config;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "ELMO_CONFIG")
public class ConfigValue {

    public static final String LAST_MEMBER_ID = "last_member_id";
    
    public static final String JWT_SECRET = "jwt_secret";

    @Id
    @Column(name = "NAME")
    private String name;

    @Column(name = "VALUE")
    private String value;
    
    public ConfigValue() {
        // used by Hibernate
    }
    
    public ConfigValue(
            final String name,
            final String value) {
        this.name = name;
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

}
