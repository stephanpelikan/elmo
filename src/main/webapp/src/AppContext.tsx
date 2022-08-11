import React, { useCallback, useMemo } from 'react';
import { User, Oauth2Client, UserStatus, GuiApi, AppInformation } from './client/gui';
import { getGuiApi } from './client';
import { getAdministrationApi } from './client';
import { AdministrationApi } from 'client/administration';
import { MessageToast } from './components/Toast';

type Action =
    | { type: 'updateOauth2Clients', oauth2Clients: Array<Oauth2Client> }
    | { type: 'updateAppInformation', appInformation: AppInformation }
    | { type: 'updateCurrentUser', user: User | null }
    | { type: 'memberApplicationFormSubmitted' }
    | { type: 'showMenu', visibility: boolean }
    | { type: 'toast', toast: Toast | undefined }
    | { type: 'updateTitle', title: string };
export type Dispatch = (action: Action) => void;
export type Toast = {
  namespace: string;
  title: string | undefined;
  message: string;
};
type State = {
  oauth2Clients: Array<Oauth2Client> | null;
  appInformation: AppInformation | null;
  currentUser: User | null | undefined;
  showMenu: boolean;
  title: string;
  toast: Toast | undefined;
};

const AppContext = React.createContext<{
  state: State;
  dispatch: Dispatch;
  administrationApi: AdministrationApi;
  guiApi: GuiApi;
  toast: (toast: Toast) => void;
  fetchOauth2Clients: () => void;
  fetchAppInformation: () => void;
  fetchCurrentUser: (resolve: (value: User | null) => void, reject: (error: any) => void) => void;
  showMenu: (visibility: boolean) => void;
  setAppHeaderTitle: (title: string) => void;
  memberApplicationFormSubmitted: () => void;
} | undefined>(undefined);

const appContextReducer: React.Reducer<State, Action> = (state, action) => {
  let newState: State;
  switch (action.type) {
  case 'updateCurrentUser':
    newState = {
      ...state,
      currentUser: action.user,
    };
    break;
  case 'memberApplicationFormSubmitted':
    newState = {
      ...state,
      currentUser: {
        ...state.currentUser,
        status: UserStatus.ApplicationSubmitted,
      }
    };
    break;
  case 'updateOauth2Clients':
    newState = {
      ...state,
      oauth2Clients: action.oauth2Clients,
    };
    break;
  case 'updateAppInformation':
    newState = {
      ...state,
      appInformation: action.appInformation,
    };
    break;
  case 'showMenu': {
    newState = {
      ...state,
      showMenu: action.visibility,
    };
    break;
  }
  case 'toast': {
    newState = {
      ...state,
      toast: action.toast,
    };
    break;
  }
  case 'updateTitle': {
    newState = {
      ...state,
      title: action.title,
    };
    break;
  }
  default: throw new Error(`Unhandled app-context action-type: ${action}`);
	}
	return newState;
};

type AppContextProviderProps = {
	children?: React.ReactNode;
};

const AppContextProvider = ({ children }: AppContextProviderProps) => {
	const [state, dispatch] = React.useReducer(appContextReducer, {
    currentUser: undefined,
    oauth2Clients: null,
    appInformation: null,
    showMenu: false,
    title: 'app',
    toast: undefined,
  });
  const administrationApi = useMemo(() => getAdministrationApi(dispatch), [ dispatch ]);
  const guiApi = useMemo(() => getGuiApi(dispatch), [ dispatch ]);
  
  const fetchOauth2Clients = useCallback(() => fetchOauth2ClientsFromGuiApi(state, dispatch, guiApi),
      [ guiApi, state ]);
  const fetchAppInformation = useCallback(() => fetchAppInformationFromGuiApi(state, dispatch, guiApi),
      [ guiApi, state ]);
  const fetchCurrentUser = useCallback((resolve, reject) => fetchCurrentUserFromGui(state, dispatch, guiApi, resolve, reject),
      [ guiApi, state ]);
  const showMenu = useCallback((visibility: boolean) => setShowMenu(dispatch, visibility),
      [ dispatch ]);
  const setAppHeaderTitle = useCallback((title: string) => updateTitle(dispatch, title),
      [ dispatch ]); 
  const memberApplicationFormSubmitted = useCallback(() => doMemberApplicationFormSubmitted(dispatch),
      [ dispatch ]);
	const value = {
    state,
    dispatch,
    administrationApi,
    guiApi,
    toast: (t: Toast) => dispatch({ type: 'toast', toast: t }),
    fetchOauth2Clients,
    fetchAppInformation,
    fetchCurrentUser,
    showMenu,
    setAppHeaderTitle,
    memberApplicationFormSubmitted,
  };
  
	return (<AppContext.Provider value={value}>
	   {state.toast && (
      <MessageToast dispatch={dispatch} msg={state.toast} />
    )}
	   {children}
   </AppContext.Provider>);
};

const fetchOauth2ClientsFromGuiApi = async (appContextState: State, dispatch: Dispatch, guiApi: GuiApi) => {
  if (appContextState.oauth2Clients != null) {
    return new Promise((resolve, reject) => {
        resolve(appContextState.oauth2Clients as Oauth2Client[]);
    });
  }
  try {
    const oauth2Clients = await guiApi.oauth2Clients();
    dispatch({ type: 'updateOauth2Clients', oauth2Clients });
  } catch (error) {
    console.error(error);
  }
}

const fetchAppInformationFromGuiApi = async (appContextState: State, dispatch: Dispatch, guiApi: GuiApi) => {
  if (appContextState.appInformation != null) {
    return new Promise((resolve, reject) => {
        resolve(appContextState.appInformation as AppInformation);
    });
  }
  try {
    const appInformation = await guiApi.appInformation();
    dispatch({ type: 'updateAppInformation', appInformation });
  } catch (error) {
    console.error(error);
  }
}

const fetchCurrentUserFromGui = async (appContextState: State, dispatch: Dispatch, guiApi: GuiApi, resolve: (value: User | null) => void, reject: (error: any) => void) => {
  if (appContextState.currentUser != null) {
    resolve(appContextState.currentUser);
    return;
  }
  try {
    const user = await guiApi.currentUser();
    dispatch({ type: 'updateCurrentUser', user });
    resolve(user);
  } catch (error: any) {
    if (error['status'] !== 404) {
      reject(error);
    }
    dispatch({ type: 'updateCurrentUser', user: null });
    resolve(null);
  }
}

const doMemberApplicationFormSubmitted = (dispatch: Dispatch) => {
  dispatch({ type: 'memberApplicationFormSubmitted' });
}

const setShowMenu = (dispatch: Dispatch, visibility: boolean) => {
  dispatch({ type: 'showMenu', visibility });
}

const updateTitle = (dispatch: Dispatch, title: string) => {
  dispatch({ type: 'updateTitle', title });
}

const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a <AppContext>...</AppContext>');
  }
  return context;
}

// see https://blog.logrocket.com/react-suspense-data-fetching/
const supportSuspense = <T extends any>(promise: Promise<T>) => {
  
  let status = 'pending';
  let response: T;

  const suspender = promise.then(
    (res) => {
      status = 'success';
      response = res;
    },
    (err) => {
      status = 'error';
      response = err;
    },
  );
  
  const read = () => {
    switch (status) {
      case 'pending':
        throw suspender;
      case 'error':
        throw response;
      default:
        return response;
    }
  }

  // eslint-disable-next-line
  return useCallback(read, [ ]);

}
  
export {
  AppContextProvider,
  useAppContext,
  supportSuspense,
}
