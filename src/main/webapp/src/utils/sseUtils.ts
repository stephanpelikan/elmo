import ReconnectingEventSource from "reconnecting-eventsource";


class PreconfiguredReconnectingEventSource extends ReconnectingEventSource {

  constructor(url: string | URL, eventSourceInitDict?: EventSourceInit) {
    super(url, {
      ...eventSourceInitDict,
      max_retry_time: 30000
    });
  }
  
};

export { PreconfiguredReconnectingEventSource }
