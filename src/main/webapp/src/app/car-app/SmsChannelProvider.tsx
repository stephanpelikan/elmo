import { useEffect, useState } from "react";
import { EventSourceProvider } from "react-sse-hooks";
import { useAppApi } from "./CarAppContext";
import { SmsSender } from "./SmsSender";
import { PreconfiguredReconnectingEventSource } from "../../utils/sseUtils";

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
          <EventSourceProvider eventSource={ PreconfiguredReconnectingEventSource }>
            <SmsSender token={ token } />
          </EventSourceProvider>
        </>)
      : <></>;
    
}

export { SmsChannelProvider };
