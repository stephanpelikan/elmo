package at.elmo.util.spring;

import at.elmo.member.Role;
import org.springframework.context.ApplicationEvent;

import java.time.Clock;
import java.util.List;

public abstract class NotificationEvent extends ApplicationEvent {

    private static final long serialVersionUID = 1L;
    
    public static enum Type { NEW, UPDATE, DELETE };
    
    private final Type type;
    
    private List<Role> targetRoles;

    public NotificationEvent(
            final Object source,
            final Clock clock,
            final Type type,
            final List<Role> targetRoles) {
        
        super(source, clock);
        this.type = type;
        this.targetRoles = targetRoles;
        
    }

    public NotificationEvent(
            final Object source,
            final Type type,
            List<Role> targetRoles) {
        
        super(source);
        this.type = type;
        this.targetRoles = targetRoles;
        
    }

    public Type getType() {
        return type;
    }

    public List<Role> getTargetRoles() {
        return targetRoles;
    }
    
    public boolean matchesTargetRoles(
            final List<Role> roles) {
        
        if (targetRoles == null) {
            return true;
        }
        
        return targetRoles
                .stream()
                .flatMap(targetRole -> roles.stream().map(role -> targetRole == role))
                .filter(hasMatchingRole -> hasMatchingRole)
                .findFirst()
                .isPresent();
        
    }
    
}
