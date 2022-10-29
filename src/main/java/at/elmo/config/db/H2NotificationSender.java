package at.elmo.config.db;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class H2NotificationSender {

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Async
    public void send(
            final DbNotification event) throws Exception {
        
        Thread.sleep(500);
        
        applicationEventPublisher
                .publishEvent(event);
        
    }
    
}
