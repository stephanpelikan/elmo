package at.elmo.member;

import java.util.LinkedList;
import java.util.List;

public enum Role {
    PASSANGER,
    DRIVER,
    MANAGER,
    ADMIN;

    public static List<Role> orderedByConstraint(
            final Role minimalConstraint) {
        
        final var result = new LinkedList<Role>();
        boolean found = false;
        for (final var role : Role.values()) {
            if (role == minimalConstraint) {
                found = true;
            }
            if (found) {
                result.add(role);
            }
        }
        return result;
        
    }

}