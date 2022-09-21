import { useEffect, useState } from "react";
import { EventSourceProvider } from "react-sse-hooks";
import ReconnectingEventSource from "reconnecting-eventsource";
import { useAppApi } from "./CarAppContext";
import { SmsSender } from "./SmsSender";

class PreconfiguredReconnectingEventSource extends ReconnectingEventSource {
  constructor(url: string | URL, eventSourceInitDict?: EventSourceInit) {
    super(url, {
      ...eventSourceInitDict,
      max_retry_time: 30000
    });
  }
};

const SmsChannelProvider = () => {
  
  const appApi = useAppApi();
  
  const [ token, setToken ] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const fetchToken = async () => {
      const newToken = await appApi.requestSeeAuthToken();
      setToken(newToken);
    };
    fetchToken();
  }, [ appApi, setToken ]);
  
  return token
      ? (<>{/*
// @ts-ignore */}
          <EventSourceProvider eventSource={PreconfiguredReconnectingEventSource}>
            <SmsSender token={ token } />
          </EventSourceProvider>
        </>)
      : <></>;
    
}

export { SmsChannelProvider };
