import { fetchEventSource, EventSourceMessage as FetchEventSourceMessage, FetchEventSourceInit } from "@microsoft/fetch-event-source";
import { Timeout } from "grommet";
import { Context, DependencyList, useContext, useEffect, useRef } from "react";

type SseURL = string;

type SseConnectionID = string;

interface EventSourceMessage<T> {
    id: string;
    event: string;
    data: T;
    retry?: number;
}

export type WakeupSseCallback = (() => void) | undefined;

export type OnMessageFunction<T> = (ev: EventSourceMessage<T>) => void;

type OnMessageSignature = {
  onMessage: OnMessageFunction<any>,
  messageName?: string
};

type GetConnectionFunction = (
    onMessage: OnMessageFunction<any>,
    messageName?: string
  ) => SseConnectionID;
      
type ReleaseConnectionFunction = (connectionId: SseConnectionID) => void;

export type SseContextInterface = {
  wakeupSseCallback: WakeupSseCallback,
  getConnection: GetConnectionFunction;
  releaseConnection: ReleaseConnectionFunction;
};

interface SseProviderProps extends Omit<FetchEventSourceInit, 'fetch'> {
  Context: Context<SseContextInterface>;
  buildFetchApi: () => WindowOrWorkerGlobalScope['fetch'];
  url: SseURL;
};

const onmessage = (
  ev: FetchEventSourceMessage,
  connections: Record<SseConnectionID, OnMessageSignature>
) => {
  Object
      .keys(connections)
      .map(connectionId => connections[connectionId] )
      .filter(onMessageSignature => onMessageSignature === undefined
          ? false
          : onMessageSignature.messageName
          ? onMessageSignature.messageName === ev.event
          : true)
      .forEach(onMessageSignature => {
          try {
            onMessageSignature.onMessage(
                {
                  ...ev,
                  data: parseJSONData(ev.data)
                });
          } catch (e) {
            console.error("Error on processing event", ev, e);
          }
        });
};

const parseJSONData = (data: string): any => {
  if (!Boolean(data)) {
    return undefined;
  }
  return JSON.parse(data);
}

const SseProvider = ({ url, Context, buildFetchApi, children, ...rest }: React.PropsWithChildren<SseProviderProps>) => {

  const connections = useRef<Record<SseConnectionID, OnMessageSignature>>({});
  const abortController = useRef<AbortController | undefined>(undefined);
  const closeConnectionTimer = useRef<Timeout | undefined>(undefined);
  const retryConnectTimer = useRef<Timeout | undefined>(undefined);
  
  const releaseConnection: ReleaseConnectionFunction = (connectionId) => {
    delete connections.current[connectionId];
    if (Object.keys(connections.current).length === 0) {
      if (closeConnectionTimer.current !== undefined) {
        window.clearTimeout(closeConnectionTimer.current);
      }
      closeConnectionTimer.current = window.setTimeout(() => {
    console.log('abort');
          abortController.current?.abort();
          abortController.current = undefined;
          closeConnectionTimer.current = undefined;
        }, 5000); // close connection after 5 seconds
    }
  };
  
  const buildEventSource = () => {
    console.log('build event source');
    abortController.current = new AbortController();
    fetchEventSource(
        url, {
          // since we use locking fetch-api the server has to sent an
          // ping-message immediatelly, to make the client release the lock
          fetch: buildFetchApi(),
          headers: {
            "cache-control": "no-cache"
          },
          signal: abortController.current.signal,
          onmessage: ev => onmessage(ev, connections.current),
          onclose: () => {
              throw new Error(); // if the server closes the connection unexpectedly, retry in "onerror"
            },
          onerror: (error) => {
              // @ts-ignore
              throw new Error('retry', { cause: error });
            },
          ...rest,
        }).catch((reason) => {
          if (reason.message === 'retry') {
            console.warn('Lost server connection, will rety in 15 seconds', reason.cause);
            retryConnectTimer.current = window.setTimeout(buildEventSource, 15000);
            return;
          }
          console.log('Lost server connection reason and won\'t retry', reason);
        });
  };
  
  const getConnection: GetConnectionFunction = (onMessage, messageName) => {
    if (closeConnectionTimer.current !== undefined) {
      window.clearTimeout(closeConnectionTimer.current);
      closeConnectionTimer.current = undefined;
    }
    if (abortController.current === undefined) {
      buildEventSource();
    }

    const connectionId = new Date().getTime().toString();
    connections.current = {
        ...connections.current,
        [connectionId]: {
            onMessage,
            messageName
          }
      };
    
    return connectionId;
  };
  
  const wakeupSseCallback = () => {
      if (retryConnectTimer.current === undefined) {
        return;
      }
      window.clearTimeout(retryConnectTimer.current);
      retryConnectTimer.current = undefined;
      buildEventSource();
    };
  
  return (
      <Context.Provider
          value={ {
              wakeupSseCallback,
              getConnection,
              releaseConnection,
            } }>
        {children}
      </Context.Provider>
    );
  
};

const useSse = <T, >(
  Context: Context<SseContextInterface>,
  dependencies: DependencyList,
  onMessage: OnMessageFunction<T>,
  messageName?: string
): WakeupSseCallback => {
  
  const sseContext = useContext(Context);
  
  useEffect(() => {
      const connectionId = sseContext.getConnection(onMessage, messageName);
      return () => sseContext.releaseConnection(connectionId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ sseContext, onMessage, messageName, ...dependencies ]);
  
  return sseContext.wakeupSseCallback;
  
};

export { SseProvider, useSse };
