import { OnMessageFunction, SseContextInterface, SseProvider, useSse, WakeupSseCallback } from "../../components/SseProvider";
import { createContext } from "react";
import { buildAppFetchApi } from "client/appClient";
import { useAppContext } from "AppContext";

const SSE_SMS_URL = '/api/v1/app/text-messages-notification';

interface SmsSseContextInterface extends SseContextInterface { };

const SmsSseContext = createContext<SmsSseContextInterface>(
  {
    wakeupSseCallback: () => undefined,
    getConnection: () => '',
    releaseConnection: () => undefined,
  }
);

const SmsSseProvider = ({ children, ...rest }: React.PropsWithChildren<{}>) => {
  
  const { dispatch } = useAppContext();
  
  return (<SseProvider
              url={ SSE_SMS_URL }
              Context={ SmsSseContext }
              buildFetchApi={ () => buildAppFetchApi(dispatch) }
              { ...rest }>
            { children }
          </SseProvider>);
          
};

const useSmsSse = <T, >(
    onMessage: OnMessageFunction<T>,
    messageName?: string
  ): WakeupSseCallback => useSse(
    SmsSseContext,
    onMessage,
    messageName
  );  

export { SmsSseProvider, useSmsSse };
