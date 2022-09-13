package at.elmo.util.sms;

import java.time.Clock;

import org.springframework.context.ApplicationEvent;

public class SmsEvent extends ApplicationEvent {

    private static final long serialVersionUID = 1L;

    private final String senderNumber;
    
    public SmsEvent(
            final Object source,
            final Clock clock,
            final String senderNumber) {
        
        super(source, clock);
        this.senderNumber = senderNumber;
        
    }

    public SmsEvent(
            final Object source,
            final String senderNumber) {
        
        super(source);
        this.senderNumber = senderNumber;
        
    }
    
    public String getSenderNumber() {
        return senderNumber;
    }
    
}
