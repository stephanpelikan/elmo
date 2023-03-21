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

        if (obj == null) {
            return false;
        }
        if (!getClass().isAssignableFrom(obj.getClass())) {
            return false;
        }
        final var other = (PersistenceBase<?>) obj;
        final var idA = getId();
        final var idB = other.getId();
        if (idA == null) {
            if (idB != null) {
                return false;
            }
        } else {
            if (idB == null) {
                return false;
            } else {
                return idA.equals(idB);
            }
        }
        
        return EqualsBuilder.reflectionEquals(this, obj);

    }

}
