package at.elmo.util.spring;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

public abstract class PersistenceBase<ID> {

    public abstract ID getId();

    @Override
    public int hashCode() {

        if (getId() != null) {
            return getId().hashCode();
        }
        return HashCodeBuilder.reflectionHashCode(this);

    }

    @Override
    public boolean equals(Object obj) {

        return EqualsBuilder.reflectionEquals(this, obj);

    }

}
