import { WakeupSseCallback } from "components/SseProvider";
import { useCallback, useEffect, useRef } from "react";
import { useAppApi } from './CarAppContext';
import { useSmsSse } from "./SmsSseProvider";

interface SmsEvent {
  senderNumber: string;
}

// @ts-ignore
const smsCommunicator = typeof webkit !== 'undefined' ? webkit.messageHandlers.native : window.native;

const SmsSender = () => {

  const wakeupSseCallback = useRef<WakeupSseCallback>(undefined);
  const appApi = useAppApi(wakeupSseCallback);

  const sendSms = useCallback(async () => {
    const result = await appApi.requestTextMessages();
    result.textMessages?.forEach(
        message => {
            if (smsCommunicator) {
              smsCommunicator.postMessage(JSON.stringify([
                  {
                    "type": "SMS",
                    "phoneNumber": message.recipient,
                    "content": message.content,
                  }
                ]));
            }
            console.log(`Sent SMS to Flutter for ${ message.recipient }`);
          });
   
  }, [appApi]);

  useEffect(() => {
    
    const timer = setInterval(() => sendSms(), 300000);
    return () => clearInterval(timer);
    
  }, [sendSms]);

  wakeupSseCallback.current = useSmsSse<SmsEvent>(
      [sendSms],
      sendSms,
      'SMS'); 

  return (<></>);
  
}

export { SmsSender };
