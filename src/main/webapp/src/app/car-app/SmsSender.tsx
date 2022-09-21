import { useCallback, useEffect } from "react";
import { useEventSource, useEventSourceListener } from "react-sse-hooks";
import { useAppApi } from './CarAppContext';

interface SmsSenderProps {
  token: string;
}

interface SmsEvent {
  senderNumber: string;
}

// @ts-ignore
const smsCommunicator = typeof webkit !== 'undefined' ? webkit.messageHandlers.native : window.native;

const SmsSender = ({ token }: SmsSenderProps) => {

  const appApi = useAppApi();

  const smsSource = useEventSource({
    source: '/api/v1/app/text-messages-notification/' + encodeURIComponent(token),
  });

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
    
    const timer = setInterval(() => sendSms(), 60000);
    return () => clearInterval(timer);
    
  }, [sendSms]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { startListening, stopListening } = useEventSourceListener<SmsEvent>({
      source: smsSource,
      startOnInit: true,
      event: {
        name: "SMS",
        listener: ({ data }) => { sendSms() },
      },
    },
    [smsSource, sendSms]);

  return (<></>);
  
}

export { SmsSender };
