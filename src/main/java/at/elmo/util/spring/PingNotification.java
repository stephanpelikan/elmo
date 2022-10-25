package at.elmo.util.spring;

import java.time.Clock;

public class PingNotification extends NotificationEvent {

    private static final long serialVersionUID = 1L;
    
    private static final String TYPE = "Ping";
    
    public PingNotification(Object source, Clock clock) {
        super(source, clock, TYPE);
    }

    public PingNotification(Object source) {
        super(source, TYPE);
    }
    
}
