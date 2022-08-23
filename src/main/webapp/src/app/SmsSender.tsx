import { useCallback, useEffect } from "react";
import { useEventSource, useEventSourceListener } from "react-sse-hooks";
import { useAppContext } from '../AppContext';

interface SmsEvent {
  senderNumber: string;
}

const phoneNumber = '+431234567890';

// @ts-ignore
const nativeCommunicator = typeof webkit !== 'undefined' ? webkit.messageHandlers.native : window.native;

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
          nativeCommunicator.postMessage(JSON.stringify([
            {
              "type": "SMS",
              "phoneNumber": message.recipient,
              "smsText": message.content,
            }
          ]));
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
        listener: ({ data }) => { console.log(data); sendSms(data.senderNumber) },
      },
    },
    [smsSource, sendSms]);

  return (<></>);
  
}

export { SmsSender };
