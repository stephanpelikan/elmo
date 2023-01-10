package at.elmo.app.api;

import at.elmo.util.sms.SmsEvent;

public interface AppApiControllerScheduledOrAsync {

    void cleanupSmsEmitters();
    
    void sendSms(SmsEvent event) throws Exception;
    
}
