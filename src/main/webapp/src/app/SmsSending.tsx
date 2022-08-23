import { SmsSender } from './SmsSender';
import { EventSourceProvider } from 'react-sse-hooks';
import ReconnectingEventSource from "reconnecting-eventsource";

class PreconfiguredReconnectingEventSource extends ReconnectingEventSource {
  constructor(url: string | URL, eventSourceInitDict?: EventSourceInit) {
    super(url, {
      ...eventSourceInitDict,
      max_retry_time: 3000
    });
  }
};

// @ts-ignore
const nativeCommunicator = typeof webkit !== 'undefined' ? webkit.messageHandlers.native : window.native;

const SmsSending = () => {
  
  if (!nativeCommunicator) {
    return (<></>);
  }

  return (
    <>{/*
// @ts-ignore */}
      <EventSourceProvider eventSource={PreconfiguredReconnectingEventSource}>
        <SmsSender />
      </EventSourceProvider>
    </>);
 
}

export { SmsSending };
