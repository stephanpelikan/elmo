package at.elmo.util.spring;

import java.time.Clock;

public class PingNotification extends NotificationEvent {

    private static final long serialVersionUID = 1L;
    
    private static final String SOURCE = "Ping";
    
    public PingNotification(Clock clock) {
        super(SOURCE, clock, NotificationEvent.Type.NEW, null);
    }

    public PingNotification() {
        super(SOURCE, NotificationEvent.Type.NEW, null);
    }
    
}
