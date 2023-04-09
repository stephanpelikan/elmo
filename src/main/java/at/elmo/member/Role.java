package at.elmo.member;

import java.util.LinkedList;
import java.util.List;

public enum Role {
    PASSENGER(Role.ROLE_PASSENGER),
    DRIVER(Role.ROLE_DRIVER),
    CAR(Role.ROLE_CAR), // used for authentication of Android Tablet car app
    MANAGER(Role.ROLE_MANAGER),
    ADMIN(Role.ROLE_ADMIN);

    public static final String ROLE_PASSENGER = "ROLE_PASSENGER";
    public static final String ROLE_DRIVER = "ROLE_DRIVER";
    public static final String ROLE_CAR = "ROLE_CAR";
    public static final String ROLE_MANAGER = "ROLE_MANAGER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    
    private String role;

    private Role(
            final String role) {
        
        this.role = role;
        
    }
    
    public String getRole() {
        
        return role;
        
    }
    
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