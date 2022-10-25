package at.elmo.util.spring;

import org.springframework.context.ApplicationEvent;

import java.time.Clock;

public abstract class NotificationEvent extends ApplicationEvent {

    private static final long serialVersionUID = 1L;
    
    private final String type;

    public NotificationEvent(
            final Object source,
            final Clock clock,
            final String type) {
        
        super(source, clock);
        this.type = type;
        
    }

    public NotificationEvent(
            final Object source,
            final String type) {
        
        super(source);
        this.type = type;
        
    }

    public String getType() {
        return type;
    }
    
}
