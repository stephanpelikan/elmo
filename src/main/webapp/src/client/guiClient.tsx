import { Configuration as GuiConfiguration, LoginApi, MemberApi, OnboardingApi, PassengerServiceApi } from './gui';
import { Dispatch, useAppContext } from '../AppContext';
import { buildFetchApi, doLogout } from '../utils/fetchApi';
import { OnMessageFunction, SseContextInterface, SseProvider, useSse, WakeupSseCallback } from '../components/SseProvider';
import { createContext } from 'react';
import { ReservationApi } from './gui/apis/ReservationApi';

const SSE_UPDATE_URL = "/api/v1/gui/updates";

const getLoginGuiApi = (
  dispatch: Dispatch,
  wakeupSseCallback?: WakeupSseCallback
): LoginApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch, wakeupSseCallback),
  });
  return new LoginApi(config);
};

const getOnboardingGuiApi = (
  dispatch: Dispatch,
  wakeupSseCallback?: WakeupSseCallback
): OnboardingApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch, wakeupSseCallback),
  });
  return new OnboardingApi(config);
};

const getMemberGuiApi = (
  dispatch: Dispatch,
  wakeupSseCallback?: WakeupSseCallback
): MemberApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch, wakeupSseCallback),
  });
  return new MemberApi(config);
};

const getReservationGuiApi = (
  dispatch: Dispatch,
  wakeupSseCallback?: WakeupSseCallback
): ReservationApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch, wakeupSseCallback),
  });
  return new ReservationApi(config);
};

const getPassengerServiceGuiApi = (
  dispatch: Dispatch,
  wakeupSseCallback?: WakeupSseCallback
): PassengerServiceApi => {
  const config = new GuiConfiguration({
    basePath: '/api/v1',
    fetchApi: buildFetchApi(dispatch, wakeupSseCallback),
  });
  return new PassengerServiceApi(config);
};

interface GuiSseContextInterface extends SseContextInterface { };

const GuiSseContext = createContext<GuiSseContextInterface>(
  {
    wakeupSseCallback: () => undefined,
    getConnection: () => '',
    releaseConnection: () => undefined,
  }
);

const GuiSseProvider = ({ children, ...rest }: React.PropsWithChildren<{}>) => {
  
  const { dispatch } = useAppContext();
  
  return (<SseProvider
              url={ SSE_UPDATE_URL }
              Context={ GuiSseContext }
              buildFetchApi={ () => buildFetchApi(dispatch) }
              { ...rest }>
            { children }
          </SseProvider>);
          
};

const useGuiSse = <T, >(
    //dependencies: DependencyList,
    onMessage: OnMessageFunction<T>,
    messageName?: string | RegExp
  ): WakeupSseCallback => useSse(
    GuiSseContext,
    //dependencies,
    onMessage,
    messageName
  );  

export {
    GuiSseProvider,
    useGuiSse,
    getLoginGuiApi,
    getOnboardingGuiApi,
    getMemberGuiApi,
    getPassengerServiceGuiApi,
    getReservationGuiApi,
    doLogout,
  };

