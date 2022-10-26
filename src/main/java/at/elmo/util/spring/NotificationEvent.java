package at.elmo.util.spring;

import org.springframework.context.ApplicationEvent;

import java.time.Clock;

public abstract class NotificationEvent extends ApplicationEvent {

    private static final long serialVersionUID = 1L;
    
    public static enum Type { NEW, UPDATE, DELETE };
    
    private final Type type;

    public NotificationEvent(
            final Object source,
            final Clock clock,
            final Type type) {
        
        super(source, clock);
        this.type = type;
        
    }

    public NotificationEvent(
            final Object source,
            final Type type) {
        
        super(source);
        this.type = type;
        
    }

    public Type getType() {
        return type;
    }
    
}
