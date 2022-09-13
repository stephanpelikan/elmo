import { useCallback, useEffect } from "react";
import { useEventSource, useEventSourceListener } from "react-sse-hooks";
import { useAppContext } from '../AppContext';

interface SmsEvent {
  senderNumber: string;
}

const phoneNumber = '+431234567890';

// @ts-ignore
const smsCommunicator = typeof webkit !== 'undefined' ? webkit.messageHandlers.native : window.native;

const SmsSender = () => {

  const { guiApi } = useAppContext();

  const smsSource = useEventSource({
    source: '/api/v1/drivers/sms?phoneNo=' + encodeURIComponent(phoneNumber),
  });

  const sendSms = useCallback(async (senderNumber: string) => {

    const result = await guiApi.requestTextMessages({
        textMessageRequest: { sender: senderNumber }
      });
    
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
   
  }, [guiApi]);

  useEffect(() => {
    
    const timer = setInterval(() => sendSms(phoneNumber), 60000);
    return () => clearInterval(timer);
    
  }, [sendSms]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { startListening, stopListening } = useEventSourceListener<SmsEvent>({
      source: smsSource,
      startOnInit: true,
      event: {
        name: "SMS",
        listener: ({ data }) => { sendSms(data.senderNumber) },
      },
    },
    [smsSource, sendSms]);

  return (<></>);
  
}

export { SmsSender };