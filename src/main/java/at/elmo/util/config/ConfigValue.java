package at.elmo.util.config;

import at.elmo.util.spring.PersistenceBase;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "ELMO_CONFIG")
class ConfigValue extends PersistenceBase<String> {

    @Id
    @Column(name = "NAME")
    private String name;

    @Column(name = "CONFIG_VALUE")
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

    @Override
    public String getId() {
        // TODO Auto-generated method stub
        return getName();
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
